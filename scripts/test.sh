#!/bin/bash

echo "🧪 Running Test Suite..."
echo "========================"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Run different types of tests
echo ""
echo "🔍 Running Unit Tests..."
npm run test -- --testPathPattern="__tests__/(components|contexts|hooks|utils)" --verbose

echo ""
echo "🔗 Running Integration Tests..."
npm run test -- --testPathPattern="__tests__/integration" --verbose

echo ""
echo "📊 Running Coverage Report..."
npm run test:coverage

echo ""
echo "✅ Test Suite Complete!"
echo ""
echo "📋 Test Commands Available:"
echo "  npm test              - Run all tests"
echo "  npm run test:watch    - Run tests in watch mode"
echo "  npm run test:coverage - Run tests with coverage"
echo ""
echo "🎯 Coverage Thresholds:"
echo "  Branches: 70%"
echo "  Functions: 70%"
echo "  Lines: 70%"
echo "  Statements: 70%"
