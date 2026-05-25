#!/bin/bash
echo "Installing dependencies..."
npm install
echo "Setting up database..."
npx prisma generate
npx prisma db push
echo "Done! Run: ./2-start.sh"
