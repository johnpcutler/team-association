/**
 * Tests for the Org Sensing status system
 * Run with: node test_status.js
 */

// Mock DOM and status system for testing
const STATUSES = ['not-present', 'aspirational', 'emerging', 'ubiquitous', 'retiring'];
const STATUS_LABELS = {
    'not-present': 'Not present',
    'aspirational': 'Aspirational',
    'emerging': 'Emerging',
    'ubiquitous': 'Ubiquitous',
    'retiring': 'Retiring'
};

// Status storage simulation
let statusMap = new Map();

// Test helper functions
function setStatus(statusKey, status) {
    statusMap.set(statusKey, status);
}

function getStatus(statusKey) {
    return statusMap.get(statusKey) || 'not-present';
}

function cycleStatus(statusKey) {
    const currentStatus = statusMap.get(statusKey) || 'not-present';
    const currentIndex = STATUSES.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUSES.length;
    const nextStatus = STATUSES[nextIndex];
    setStatus(statusKey, nextStatus);
    return nextStatus;
}

function getSelectedItems() {
    const selected = [];
    statusMap.forEach((status, statusKey) => {
        if (status !== 'not-present') {
            const [section, item] = statusKey.split('-').map(Number);
            selected.push({
                section,
                item,
                status
            });
        }
    });
    return selected;
}

// Backward compatibility: convert old format (no status) to 'emerging'
function restoreSelections(selections) {
    selections.forEach(({ section, item, status }) => {
        const statusKey = `${section}-${item}`;
        // Backward compatibility: if no status, default to 'emerging'
        const restoredStatus = status || 'emerging';
        setStatus(statusKey, restoredStatus);
    });
}

// Test suite
function runTests() {
    let passed = 0;
    let failed = 0;
    
    function test(name, fn) {
        try {
            fn();
            console.log(`✓ ${name}`);
            passed++;
        } catch (error) {
            console.error(`✗ ${name}`);
            console.error(`  ${error.message}`);
            failed++;
        }
    }
    
    function assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }
    
    function assertEqual(actual, expected, message) {
        if (actual !== expected) {
            throw new Error(message || `Expected ${expected}, got ${actual}`);
        }
    }
    
    // Reset state before each test
    function reset() {
        statusMap.clear();
    }
    
    console.log('Running status system tests...\n');
    
    // Test 1: Default status is 'not-present'
    reset();
    test('Default status is "not-present"', () => {
        assertEqual(getStatus('0-0'), 'not-present');
    });
    
    // Test 2: Setting status works
    reset();
    test('Setting status works', () => {
        setStatus('0-0', 'emerging');
        assertEqual(getStatus('0-0'), 'emerging');
    });
    
    // Test 3: Cycling through statuses
    reset();
    test('Cycling through statuses works', () => {
        const statusKey = '0-0';
        assertEqual(cycleStatus(statusKey), 'aspirational');
        assertEqual(cycleStatus(statusKey), 'emerging');
        assertEqual(cycleStatus(statusKey), 'ubiquitous');
        assertEqual(cycleStatus(statusKey), 'retiring');
        assertEqual(cycleStatus(statusKey), 'not-present');
        assertEqual(cycleStatus(statusKey), 'aspirational'); // Wraps around
    });
    
    // Test 4: getSelectedItems excludes 'not-present'
    reset();
    test('getSelectedItems excludes "not-present"', () => {
        setStatus('0-0', 'not-present');
        setStatus('0-1', 'emerging');
        setStatus('0-2', 'ubiquitous');
        const selected = getSelectedItems();
        assertEqual(selected.length, 2);
        assert(selected.some(s => s.status === 'emerging'));
        assert(selected.some(s => s.status === 'ubiquitous'));
    });
    
    // Test 5: Backward compatibility - old format converts to 'emerging'
    reset();
    test('Backward compatibility: old format converts to "emerging"', () => {
        const oldFormat = [
            { section: 0, item: 0 }, // No status field
            { section: 0, item: 1, status: 'ubiquitous' } // Has status
        ];
        restoreSelections(oldFormat);
        assertEqual(getStatus('0-0'), 'emerging'); // Should default to emerging
        assertEqual(getStatus('0-1'), 'ubiquitous'); // Should keep existing status
    });
    
    // Test 6: Multiple items with different statuses
    reset();
    test('Multiple items with different statuses', () => {
        setStatus('0-0', 'aspirational');
        setStatus('1-0', 'emerging');
        setStatus('2-0', 'ubiquitous');
        setStatus('3-0', 'retiring');
        setStatus('4-0', 'not-present');
        
        const selected = getSelectedItems();
        assertEqual(selected.length, 4);
        assert(selected.some(s => s.status === 'aspirational'));
        assert(selected.some(s => s.status === 'emerging'));
        assert(selected.some(s => s.status === 'ubiquitous'));
        assert(selected.some(s => s.status === 'retiring'));
    });
    
    // Test 7: Encoding/decoding selections
    reset();
    test('Encoding and decoding selections', () => {
        setStatus('0-0', 'emerging');
        setStatus('1-2', 'ubiquitous');
        
        const selected = getSelectedItems();
        const json = JSON.stringify(selected);
        const encoded = btoa(json);
        const decoded = JSON.parse(atob(encoded));
        
        assertEqual(decoded.length, 2);
        assert(decoded.some(s => s.section === 0 && s.item === 0 && s.status === 'emerging'));
        assert(decoded.some(s => s.section === 1 && s.item === 2 && s.status === 'ubiquitous'));
    });
    
    // Test 8: All statuses are valid
    reset();
    test('All statuses are valid', () => {
        STATUSES.forEach(status => {
            setStatus('0-0', status);
            assertEqual(getStatus('0-0'), status);
        });
    });
    
    // Test 9: Clear all resets to 'not-present'
    reset();
    test('Clear all resets to "not-present"', () => {
        setStatus('0-0', 'emerging');
        setStatus('0-1', 'ubiquitous');
        statusMap.clear();
        assertEqual(getStatus('0-0'), 'not-present');
        assertEqual(getStatus('0-1'), 'not-present');
    });
    
    // Test 10: Status labels are correct
    test('Status labels are correct', () => {
        assertEqual(STATUS_LABELS['not-present'], 'Not present');
        assertEqual(STATUS_LABELS['aspirational'], 'Aspirational');
        assertEqual(STATUS_LABELS['emerging'], 'Emerging');
        assertEqual(STATUS_LABELS['ubiquitous'], 'Ubiquitous');
        assertEqual(STATUS_LABELS['retiring'], 'Retiring');
    });
    
    console.log(`\nTests completed: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Run tests
if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };
