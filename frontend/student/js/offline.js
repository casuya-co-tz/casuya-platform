"use strict";

const OfflineStudentApp = (function() {
    let instance;

    class OfflineStudentApp {
        constructor() {
            if (instance) return instance;
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
                this.casuyaBridge = window.casuyaBridge || new window.CasuyaBridge();
                await this.casuyaBridge.ensureInitialized();
            }
            this.progressTracker = new ProgressTracker(this.casuyaBridge);
            this.lessonCache = new LessonCache(this.casuyaBridge);
            this.syncStatus = new SyncStatus(this.casuyaBridge);
            this.startSyncMonitor();
            this.setupOfflineHandlers();
            this.showConflictUI();
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
                return { fromCache: true, data: lessonData, metadata: { cached: true, lastAccessed: new Date().toISOString() } };
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
                    headers: { 'Cache-Control': 'max-age=3600' }
                });
                if (!response.ok) throw new Error(`Failed to fetch lesson: ${response.statusText}`);
                const lessonData = await response.json();
                this.updateCacheStats('miss');
                return lessonData;
            } finally {
                clearTimeout(timeoutId);
            }
        }

        recordProgress(lessonId, progressData) {
            const operation = { type: 'progress', lessonId, data: progressData, timestamp: Date.now(), retried: 0 };
            this.pendingProgressCount++;
            this.syncStatus.addPendingProgress();
            this.casuyaBridge.saveProgress(lessonId, this.getCurrentStudentId(), progressData)
                .then(record => {
                    this.pendingProgressCount--;
                    this.syncStatus.removePendingProgress();
                })
                .catch(error => {
                    this.pendingProgressCount--;
                    this.syncStatus.removePendingProgress();
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
                this.syncStatus.updateStatus('session', { id: session.id, active: true });
            } catch (error) {
                console.error('Failed to store session:', error);
            }
        }

        async restoreSession() {
            const studentId = this.getCurrentStudentId();
            const session = await this.casuyaBridge.getActiveSession(studentId);
            if (session) {
                this.restoreCourse(session.courseId);
                this.restoreLesson(session.lessonId);
                this.restoreProgress(session.progress);
                this.syncStatus.updateStatus('restored', { sessionId: session.id, courseId: session.courseId, lessonId: session.lessonId });
                return session;
            }
            return null;
        }

        async ensureSync() {
            const isOnline = !this.casuyaBridge.isOffline();
            if (isOnline) {
                const pendingCount = await this.casuyaBridge.getPendingCount();
                if (pendingCount > 0) {
                    this.syncStatus.updateStatus('syncing', { count: pendingCount });
                    try {
                        await this.casuyaBridge.syncService.syncAll();
                        this.syncStatus.updateStatus('synced', { message: 'All pending items synced successfully' });
                    } catch (error) {
                        this.syncStatus.updateStatus('sync-error', { error: error.message });
                    }
                } else {
                    this.syncStatus.updateStatus('synced', { message: 'No pending items' });
                }
            } else {
                this.syncStatus.updateStatus('offline', { pendingItems: this.pendingProgressCount, lastSync: localStorage.getItem('lastSyncTime') });
            }
        }

        async showConflictUI() {
            const conflicts = await this.casuyaBridge.getConflicts();
            if (conflicts.length === 0) return;
            const container = document.getElementById('conflict-resolver');
            if (!container) return;
            container.innerHTML = '<h3>Sync Conflicts</h3>';
            container.style.display = 'block';
            for (const conflict of conflicts) {
                const div = document.createElement('div');
                div.className = 'conflict-item';
                div.innerHTML = `
                    <p>Conflict in <strong>${conflict.type}</strong></p>
                    <p>Resolved by: ${conflict.resolvedBy || 'pending'}</p>
                    <p>Last error: ${conflict.lastError || 'unknown'}</p>
                    <button onclick="window.offlineApp.forceResync('${conflict.id}')">Retry Sync</button>
                `;
                container.appendChild(div);
            }
        }

        async forceResync(itemId) {
            await this.casuyaBridge.forceResync(itemId);
            this.showConflictUI();
            this.ensureSync();
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
            setInterval(() => { this.ensureSync().catch(console.error); }, 30000);
        }

        setupOfflineHandlers() {
            window.addEventListener('beforeunload', () => { this.saveCurrentSession(); });
            window.addEventListener('focus', () => { this.ensureSync().catch(console.error); });
        }

        retryFailedOperation(operation) {
            operation.retried++;
            if (operation.retried < 3) {
                setTimeout(() => { this.recordProgress(operation.lessonId, operation.data); }, Math.pow(2, operation.retried) * 1000);
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
    return this.casuyaBridge.saveProgress(lessonId, this.getStudentId(), progressData);
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
    if (this.statusElement) {
        this.statusElement.textContent = `Sync: ${status} (${data.message || ''})`;
        this.statusElement.className = `sync-status ${status}`;
    }
    if (data && data.syncStatus !== undefined) this.pendingCount = data.syncStatus;
    this.updateStatusIndicator();
};

SyncStatus.prototype.addPendingProgress = function() {
    this.pendingCount++;
    this.updateStatusIndicator();
};

SyncStatus.prototype.removePendingProgress = function() {
    if (this.pendingCount > 0) { this.pendingCount--; this.updateStatusIndicator(); }
};

SyncStatus.prototype.updateStatusIndicator = function() {
    const indicator = document.getElementById('sync-indicator');
    if (indicator) {
        indicator.textContent = this.pendingCount > 0 ? `Pending: ${this.pendingCount}` : 'Synced';
        indicator.className = this.pendingCount > 0 ? 'sync-indicator pending' : 'sync-indicator synced';
    }
};

window.OfflineStudentApp = OfflineStudentApp;
