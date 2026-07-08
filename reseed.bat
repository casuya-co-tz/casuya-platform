@echo off
cd /d "C:\Users\Admin\Desktop\casuya-ecosytems\casuya-platform"
echo Clearing database...
python -c "import sys; sys.path.insert(0,'.'); exec(open('force_reseed.py').read())"
echo Done.
pause
