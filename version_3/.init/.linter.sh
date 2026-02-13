#!/bin/bash
cd /home/kavia/workspace/code-generation/digitalt3-learning-insights-platform-311763-311774/lms_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

