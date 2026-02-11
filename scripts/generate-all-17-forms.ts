/**
 * Generate all 17 React Forms
 * 
 * This script creates form definitions, components, and pages for all 17 forms
 */

import * as fs from 'fs';
import * as path from 'path';

const ALL_FORMS = [
    // Already done (Fillout forms)
    { id: 'eBxXtLZdK4us', name: 'Quick Start (Current Benefits) Multi-Page', done: true },
    { id: 'rZhiEaUEskus', name: 'Update Quickstart (w/ current benefits)', done: true },
    { id: 'gn6WNJPJKTus', name: 'Update PEO/HR', done: true },
    { id: 'urHF8xDu7eus', name: 'Update Broker Role', done: true },
    
    // Remaining 13 forms
    { id: 'rec4V98J6aPaM3u9H', name: 'Medical Coverage Survey', done: false },
    { id: 'rec7NfuiBQ8wrEmu7', name: 'Workers Compensation', done: false },
    { id: 'recFVcfdoXkUjIcod', name: 'Add New Group', done: false },
    { id: 'recFxyNqTLDdrxXN2', name: 'Benefits Administration', done: false },
    { id: 'recGrsR8Sdx96pckJ', name: 'Benefits Compliance', done: false },
    { id: 'recKzuznmqq29uASl', name: 'PEO/EOR Assessment', done: false },
    { id: 'recOE9pVakkobVzU7', name: 'Appoint Betafits', done: false },
    { id: 'recOt6cX0t1DksDFT', name: 'HR Tech', done: false },
    { id: 'recUnTZFK5UyfWqzm', name: 'Comprehensive Intake', done: false },
    { id: 'recdjXjySYuYUGkdP', name: 'Premiums / Contribution Strategy', done: false },
    { id: 'rechTHxZIxS3bBcqF', name: 'Basic Intake Form', done: false },
    { id: 'reclUQ6KhVzCssuVl', name: 'Quick Start (New Benefits)', done: false },
    { id: 'recmB9IdRhtgckvaY', name: 'Benefits Pulse Survey', done: false },
    { id: 'recsLJiBVdED8EEbr', name: 'Document Uploader', done: false },
    { id: 'recufWIRuSFArZ9GG', name: 'Quick Start', done: false },
    { id: 'recxH9Jrk10bbqU58', name: 'Broker Role', done: false },
    { id: 'recySUNj6jv47SOKr', name: 'NDA', done: false },
];

console.log(`Total forms: ${ALL_FORMS.length}`);
console.log(`Already done: ${ALL_FORMS.filter(f => f.done).length}`);
console.log(`To create: ${ALL_FORMS.filter(f => !f.done).length}`);

export { ALL_FORMS };
