// Script to check Firebase tickets collection
require('dotenv').config();
const firebase = require('./firebase');

async function checkFirebaseTickets() {
    console.log('🔍 Checking Firebase tickets collection...\n');
    
    if (!firebase || !firebase.collections || !firebase.collections.tickets) {
        console.error('❌ Firebase not configured or tickets collection not found!');
        process.exit(1);
    }
    
    try {
        const snapshot = await firebase.collections.tickets.get();
        
        if (snapshot.empty) {
            console.log('📭 No tickets found in Firebase');
            console.log('\n💡 To add tickets:');
            console.log('   1. Create a ticket in Discord');
            console.log('   2. Close the ticket (click Close Ticket button)');
            console.log('   3. It will sync to Firebase automatically');
            process.exit(0);
        }
        
        console.log(`📊 Found ${snapshot.size} tickets in Firebase:\n`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('━'.repeat(60));
            console.log(`Ticket ID: ${doc.id}`);
            console.log(`User: ${data.username || data.userId}`);
            console.log(`Department: ${data.department || data.type}`);
            console.log(`Status: ${data.status}`);
            console.log(`Created: ${data.createdAt}`);
            console.log(`Closed: ${data.closedAt || 'Not closed'}`);
            console.log(`HTML Transcript: ${data.transcriptHtml ? 'Yes ✅' : 'No ❌'}`);
            console.log(`Text Transcript: ${data.transcript?.length || 0} messages`);
            console.log('');
        });
        
        console.log('━'.repeat(60));
        
        // Check for closed tickets with transcripts
        const closedWithTranscript = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'closed' && (data.transcriptHtml || data.transcript?.length > 0)) {
                closedWithTranscript.push(doc.id);
            }
        });
        
        console.log(`\n✅ Tickets that WILL show in dashboard: ${closedWithTranscript.length}`);
        if (closedWithTranscript.length > 0) {
            closedWithTranscript.forEach(id => console.log(`   - ${id}`));
        }
        
    } catch (error) {
        console.error('❌ Error reading Firebase:', error);
        process.exit(1);
    }
    
    process.exit(0);
}

checkFirebaseTickets();
