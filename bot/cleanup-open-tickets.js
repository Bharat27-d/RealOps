// Script to clean up old open tickets from Firebase
require('dotenv').config();
const firebase = require('./firebase');

async function cleanupOpenTickets() {
    console.log('🧹 Cleaning up old open tickets from Firebase...\n');
    
    if (!firebase || !firebase.collections || !firebase.collections.tickets) {
        console.error('❌ Firebase not configured!');
        process.exit(1);
    }
    
    try {
        const snapshot = await firebase.collections.tickets.get();
        
        if (snapshot.empty) {
            console.log('📭 No tickets found in Firebase');
            process.exit(0);
        }
        
        console.log(`📊 Found ${snapshot.size} total tickets`);
        
        // Find all open tickets
        const openTickets = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.status === 'open' || !data.closedAt) {
                openTickets.push({ id: doc.id, data });
            }
        });
        
        console.log(`🔍 Found ${openTickets.length} open tickets to remove\n`);
        
        if (openTickets.length === 0) {
            console.log('✅ No open tickets to clean up!');
            process.exit(0);
        }
        
        console.log('⚠️  WARNING: This will delete the following tickets from Firebase:');
        console.log('━'.repeat(60));
        openTickets.forEach(ticket => {
            console.log(`   ${ticket.id} - ${ticket.data.department || ticket.data.type} (${ticket.data.username || ticket.data.userId})`);
        });
        console.log('━'.repeat(60));
        console.log('\n⏳ Deleting in 3 seconds... (Press Ctrl+C to cancel)');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('\n🗑️  Deleting open tickets...\n');
        
        let deleted = 0;
        let failed = 0;
        
        for (const ticket of openTickets) {
            try {
                await firebase.collections.tickets.doc(ticket.id).delete();
                deleted++;
                console.log(`✅ Deleted: ${ticket.id}`);
            } catch (error) {
                failed++;
                console.error(`❌ Failed to delete ${ticket.id}:`, error.message);
            }
        }
        
        console.log('\n━'.repeat(60));
        console.log('📊 Cleanup Summary:');
        console.log(`   ✅ Deleted: ${deleted}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📝 Total: ${openTickets.length}`);
        console.log('━'.repeat(60));
        
        const remainingSnapshot = await firebase.collections.tickets.get();
        console.log(`\n✅ Firebase now has ${remainingSnapshot.size} tickets (closed only)`);
        console.log('\n💡 Next steps:');
        console.log('   1. Create a new ticket in Discord');
        console.log('   2. Send some messages');
        console.log('   3. Click "Close Ticket"');
        console.log('   4. It will appear in dashboard with HTML transcript!\n');
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
    
    process.exit(0);
}

cleanupOpenTickets();
