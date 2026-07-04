"use strict";

const OfflineStudentApp = (function() {
    let instance;
    
    class OfflineStudentApp {
        constructor() {
            if (instance) {
                return instance;
            }
            
            this.casuyaBridge = null;
            this.progressTracker = null;
            this.lessonCache = null;
            this.syncStatus = null;
            this.currentSessionId = null;
            this.pendingProgressCount = 0;
            
            instance = this;
        }

        async init() {
            if (!this.casuyaBridge) {
                this.casuyaBridge = window.casuyaBridge;
                await this.casuyaBridge.ensureInitialized();
            }
            
            this.progressTracker = new ProgressTracker(this.casuyaBridge);
            this.lessonCache = new LessonCache(this.casuyaBridge);
            this.syncStatus = new SyncStatus(this.casuyaBridge);
            
            this.startSyncMonitor();
            this.setupOfflineHandlers();
            
            return this;
        }

        async loadLessonForOffline(lessonId) {
            try {
                this.syncStatus.updateStatus('loading', { lessonId });
                
                let lessonData = await this.lessonCache.get(lessonId);
                
                if (!lessonData) {
                    lessonData = await this.fetchLesson(lessonId);
                    await this.lessonCache.save(lessonId, lessonData);
                }
                
                this.updateCacheStats('hit');
                
                this.syncStatus.updateStatus('ready', { 
                    lessonId,
                    offline: true,
                    syncStatus: await this.casuyaBridge.getPendingCount()
                });
                
                return {
                    fromCache: true,
                    data: lessonData,
                    metadata: {
                        cached: true,
                        lastAccessed: new Date().toISOString()
                    }
                };
            } catch (error) {
                console.error('Failed to load lesson:', error);
                this.syncStatus.updateStatus('error', { error: error.message });
                throw error;
            }
        }

        async fetchLesson(lessonId) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);
            
            try {
                const response = await fetch(`/api/lessons/${lessonId}`, {
                    signal: controller.signal,
                    headers: {
                        'Cache-Control': 'max-age=3600'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch lesson: ${response.statusText}`);
                }
                
                const lessonData = await response.json();
                
                this.updateCacheStats('miss');
                return lessonData;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        recordProgress(lessonId, progressData) {
            const operation = {
                type: 'progress',
                lessonId,
                data: progressData,
                timestamp: Date.now(),
                retried: 0
            };
            
            this.pendingProgressCount++;
            this.syncStatus.addPendingProgress();
            
            this.casuyaBridge.saveProgress(lessonId, this.getCurrentStudentId(), progressData)
                .then(record => {
                    this.pendingProgressCount--;
                    this.syncStatus.removePendingProgress();
                    console.log('Progress saved and queued for sync:', record.id);
                })
                .catch(error => {
                    this.pendingProgressCount--;
                    this.syncStatus.removePendingProgress();
                    console.error('Failed to save progress:', error);
                    this.retryFailedOperation(operation);
                });
        }

        async saveCurrentSession() {
            const sessionData = {
                studentId: this.getCurrentStudentId(),
                courseId: this.getCurrentCourseId(),
                lessonId: this.getCurrentLessonId(),
                progress: this.getCurrentProgress(),
                lastActivity: Date.now()
            };
            
            try {
                const session = await this.casuyaBridge.storeSession(sessionData);
                this.currentSessionId = session.id;
                console.log('Session stored:', session.id);
                
                this.syncStatus.updateStatus('session', { id: session.id, active: true });
            } catch (error) {
                console.error('Failed to store session:', error);
            }
        }

        async restoreSession() {
            const studentId = this.getCurrentStudentId();
            const session = await this.casuyaBridge.getActiveSession(studentId);
            
            if (session) {
                console.log('Restored session:', session.id);
                
                this.restoreCourse(session.courseId);
                this.restoreLesson(session.lessonId);
                this.restoreProgress(session.progress);
                
                this.syncStatus.updateStatus('restored', { 
                    sessionId: session.id,
                    courseId: session.courseId,
                    lessonId: session.lessonId
                });
                
                return session;
            }
            
            console.log('No active session found');
            return null;
        }

        async ensureSync() {
            const isOnline = this.casuyaBridge.isOffline() ? false : true;
            
            if (isOnline) {
                const pendingCount = await this.casuyaBridge.getPendingCount();
                if (pendingCount > 0) {
                    console.log(`Syncing ${pendingCount} pending items...`);
                    this.syncStatus.updateStatus('syncing', { count: pendingCount });
                    
                    try {
                        await this.casuyaBridge.processQueueItem({
                            type: 'progress',
                            data: {}
                        });
                        
                        this.syncStatus.updateStatus('synced', { 
                            message: 'All pending items synced successfully'
                        });
                    } catch (error) {
                        console.error('Sync failed:', error);
                        this.syncStatus.updateStatus('sync-error', { error: error.message });
                    }
                } else {
                    this.syncStatus.updateStatus('synced', { message: 'No pending items' });
                }
            } else {
                this.syncStatus.updateStatus('offline', {
                    pendingItems: this.pendingProgressCount,
                    lastSync: localStorage.getItem('lastSyncTime')
                });
            }
        }

        getCurrentStudentId() {
            return localStorage.getItem('casuya_student_id') || 'default-student';
        }

        getCurrentCourseId() {
            return localStorage.getItem('casuya_current_course');
        }

        getCurrentLessonId() {
            return localStorage.getItem('casuya_current_lesson');
        }

        getCurrentProgress() {
            const progress = localStorage.getItem('casuya_current_progress');
            return progress ? JSON.parse(progress) : {};
        }

        restoreCourse(courseId) {
            localStorage.setItem('casuya_current_course', courseId);
        }

        restoreLesson(lessonId) {
            localStorage.setItem('casuya_current_lesson', lessonId);
        }

        restoreProgress(progress) {
            localStorage.setItem('casuya_current_progress', JSON.stringify(progress));
        }

        startSyncMonitor() {
            setInterval(() => {
                this.ensureSync().catch(console.error);
            }, 30000);
        }

        setupOfflineHandlers() {
            window.addEventListener('beforeunload', () => {
                this.saveCurrentSession();
            });
            
            window.addEventListener('focus', () => {
                this.ensureSync().catch(console.error);
            });
        }

        retryFailedOperation(operation) {
            operation.retried++;
            
            if (operation.retried < 3) {
                setTimeout(() => {
                    this.recordProgress(operation.lessonId, operation.data);
                }, Math.pow(2, operation.retried) * 1000);
            } else {
                console.error('Operation failed after all retries:', operation);
            }
        }

        updateCacheStats(type) {
            const stats = JSON.parse(localStorage.getItem('cacheStats') || '{}');
            stats[type] = (stats[type] || 0) + 1;
            localStorage.setItem('cacheStats', JSON.stringify(stats));
        }

        getCacheStats() {
            return JSON.parse(localStorage.getItem('cacheStats') || '{}');
        }
    }

    return OfflineStudentApp;
})();

const ProgressTracker = function(casuyaBridge) {
    this.casuyaBridge = casuyaBridge;
};

ProgressTracker.prototype.updateProgress = function(lessonId, progressData) {
    return this.casuyaBridge.saveProgress(
        lessonId,
        this.getStudentId(),
        progressData
    );
};

ProgressTracker.prototype.getStudentId = function() {
    return localStorage.getItem('casuya_student_id') || 'default-student';
};

const LessonCache = function(casuyaBridge) {
    this.casuyaBridge = casuyaBridge;
};

LessonCache.prototype.get = function(lessonId) {
    return this.casuyaBridge.getLessonPackage(lessonId);
};

LessonCache.prototype.save = function(lessonId, lessonData) {
    return this.casuyaBridge.cacheLessonPackage(lessonId, lessonData);
};

const SyncStatus = function(casuyaBridge) {
    this.casuyaBridge = casuyaBridge;
    this.statusElement = document.getElementById('sync-status');
    this.pendingCount = 0;
};

SyncStatus.prototype.updateStatus = function(status, data) {
    this.statusElement.textContent = `Sync: ${status} (${data.message || ''})`;
    this.statusElement.className = `sync-status ${status}`;
    
    if (data.syncStatus !== undefined) {
        this.pendingCount = data.syncStatus;
    }
    
    this.updateStatusIndicator();
};

SyncStatus.prototype.addPendingProgress = function() {
    this.pendingCount++;
    this.updateStatusIndicator();
};

SyncStatus.prototype.removePendingProgress = function() {
    if (this.pendingCount > 0) {
        this.pendingCount--;
        this.updateStatusIndicator();
    }
};

SyncStatus.prototype.updateStatusIndicator = function() {
    const indicator = document.getElementById('sync-indicator');
    if (indicator) {
        indicator.textContent = this.pendingCount > 0 ? `Pending: ${this.pendingCount}` : 'Synced';
        indicator.className = this.pendingCount > 0 ? 'sync-indicator pending' : 'sync-indicator synced';
    }
};

window.OfflineStudentApp = OfflineStudentApp;
