import React, { useState, useEffect } from 'react';
import { toLocaleStringSafe } from '../utils/dateUtils';
import { toast } from 'react-toastify';
import { 
  FaEye, FaDownload, FaUser, FaCalendar, 
  FaClock, FaTag, FaFileAlt, FaSync, FaSearch 
} from 'react-icons/fa';
import { tickets } from '../services/api';
import './Tickets.css';

function Tickets() {
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingTranscript, setViewingTranscript] = useState(null);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await tickets.getAll();
      console.log('Fetched tickets:', response.data);
      
      // Filter: Show CLOSED tickets (transcripts are optional)
      const closedTickets = (response.data || []).filter(ticket => 
        ticket.status === 'closed' || ticket.closedAt
      );
      
      // Sort by closed date, newest first
      const sorted = closedTickets.sort((a, b) => 
        new Date(b.closedAt || b.createdAt) - new Date(a.closedAt || a.createdAt)
      );
      
      setTicketList(sorted);
      console.log(`Displaying ${sorted.length} closed tickets`);
    } catch (error) {
      toast.error('Failed to load tickets');
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewTicket = async (id) => {
    try {
      const response = await tickets.getById(id);
      setSelectedTicket(response.data);
    } catch (error) {
      toast.error('Failed to load ticket details');
    }
  };

  const exportTranscript = (ticket) => {
    // If HTML transcript exists, download that
    if (ticket.transcriptHtml) {
      try {
        // Decode base64 to binary
        const binaryString = atob(ticket.transcriptHtml);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const blob = new Blob([bytes], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `RealOps-Ticket-${ticket.id}-${Date.now()}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('HTML transcript downloaded');
        return;
      } catch (error) {
        console.error('Error downloading HTML transcript:', error);
        toast.error('Failed to download HTML transcript, falling back to text');
      }
    }
    
    // Fallback to text transcript
    const content = `═══════════════════════════════════════════════════════
  REALOPS TICKET #${ticket.id}
  ═══════════════════════════════════════════════════════

  Department: ${ticket.department || ticket.type || 'N/A'}
  Subject: ${ticket.subject || 'N/A'}
  User: ${ticket.username || ticket.userId || 'Unknown'}
  User ID: ${ticket.userId || 'N/A'}

  Created: ${toLocaleStringSafe(ticket.createdAt)}
  ${ticket.closedAt ? `Closed: ${toLocaleStringSafe(ticket.closedAt)}` : ''}
  Status: ${ticket.status || 'open'}

  ${ticket.formData && Object.keys(ticket.formData).length > 0 ? `─────────────────────────────────────────────────────
  FORM DATA:
  ─────────────────────────────────────────────────────
  ${Object.entries(ticket.formData).map(([key, value]) => `${key}: ${value}`).join('\n')}

  ` : ''}═══════════════════════════════════════════════════════
  TRANSCRIPT (${ticket.transcript?.length || 0} messages)
  ═══════════════════════════════════════════════════════

  ${ticket.transcript?.map(t => `[${toLocaleStringSafe(t.timestamp)}] ${t.author}
  ${t.message}
  ${'─'.repeat(60)}`).join('\n\n') || 'No messages in transcript'}

  ═══════════════════════════════════════════════════════
  End of Ticket #${ticket.id}
  Generated: ${toLocaleStringSafe(Date.now())}
  ═══════════════════════════════════════════════════════`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RealOps-Ticket-${ticket.id}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Text transcript exported');
  };

  const viewTranscript = (ticketId) => {
    setViewingTranscript(ticketId);
  };

  const filteredTickets = ticketList.filter(ticket => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      ticket.id?.toLowerCase().includes(search) ||
      ticket.userId?.toLowerCase().includes(search) ||
      ticket.username?.toLowerCase().includes(search) ||
      ticket.subject?.toLowerCase().includes(search) ||
      ticket.department?.toLowerCase().includes(search) ||
      ticket.type?.toLowerCase().includes(search)
    );
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return '#43b581';
      case 'pending': return '#faa61a';
      case 'closed': return '#f04747';
      default: return '#5865F2';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading tickets...</p>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="card-header">
        <div>
          <h1>Closed Ticket Archive</h1>
          <p style={{ color: '#b9bbbe', marginTop: '5px' }}>
            Resolved tickets with transcripts - {ticketList.length} total
          </p>
        </div>
        <button className="btn btn-outline" onClick={fetchTickets}>
          <FaSync /> Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#b9bbbe' 
          }} />
          <input
            type="text"
            placeholder="Search by ticket ID, user, subject, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              paddingLeft: '40px', 
              width: '100%',
              background: '#2C2F33',
              border: '1px solid #40444b',
              borderRadius: '8px',
              padding: '12px 12px 12px 40px',
              color: '#dcddde',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="card">
        <div className="tickets-grid">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaTag style={{ color: getStatusColor(ticket.status) }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px' }}>#{ticket.id?.slice(0, 18) || 'N/A'}</h4>
                    <p style={{ margin: 0, color: '#b9bbbe', fontSize: '12px' }}>
                      {ticket.department || ticket.type || 'Support'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {ticket.transcriptHtml && (
                    <span 
                      style={{ 
                        background: '#FFD70020',
                        color: '#FFD700',
                        border: '1px solid #FFD700',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}
                      title="HTML transcript available"
                    >
                      HTML
                    </span>
                  )}
                  <span 
                    className="ticket-status-badge"
                    style={{ 
                      background: getStatusColor(ticket.status) + '20',
                      color: getStatusColor(ticket.status),
                      border: `1px solid ${getStatusColor(ticket.status)}`
                    }}
                  >
                    {ticket.status || 'open'}
                  </span>
                </div>
              </div>

              <div className="ticket-card-body">
                {ticket.subject && (
                  <div className="ticket-info-row">
                    <FaFileAlt style={{ color: '#b9bbbe' }} />
                    <span style={{ fontWeight: '500' }}>{ticket.subject}</span>
                  </div>
                )}
                <div className="ticket-info-row">
                  <FaUser style={{ color: '#b9bbbe' }} />
                  <span>{ticket.username || ticket.userId || 'Unknown'}</span>
                </div>
                <div className="ticket-info-row">
                  <FaCalendar style={{ color: '#b9bbbe' }} />
                  <span>{toLocaleStringSafe(ticket.createdAt).split(',')[0]}</span>
                </div>
                <div className="ticket-info-row">
                  <FaClock style={{ color: '#b9bbbe' }} />
                  <span>{toLocaleStringSafe(ticket.createdAt).split(',')[1]}</span>
                </div>
                {ticket.transcript && ticket.transcript.length > 0 && (
                  <div className="ticket-info-row">
                    <FaFileAlt style={{ color: '#b9bbbe' }} />
                    <span>{ticket.transcript.length} messages</span>
                  </div>
                )}
              </div>

              <div className="ticket-card-actions">
                <button 
                  className="btn btn-sm btn-outline" 
                  onClick={() => viewTicket(ticket.id)}
                >
                  <FaEye /> View Details
                </button>
                {(ticket.transcriptHtml || (ticket.transcript && ticket.transcript.length > 0)) && (
                  <button 
                    className="btn btn-sm btn-secondary" 
                    onClick={() => exportTranscript(ticket)}
                    title={ticket.transcriptHtml ? 'Download HTML Transcript' : 'Download Text Transcript'}
                  >
                    <FaDownload /> {ticket.transcriptHtml ? 'HTML' : 'Text'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#b9bbbe' }}>
            <FaTag size={48} style={{ marginBottom: '20px', opacity: 0.3 }} />
            <p style={{ fontSize: '18px', marginBottom: '10px' }}>No closed tickets found</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>
              {searchQuery ? 'Try adjusting your search query' : 'Closed tickets will appear here after you close them in Discord'}
            </p>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Ticket #{selectedTicket.id}</h3>
                <p style={{ color: '#b9bbbe', margin: '5px 0 0 0' }}>
                  {selectedTicket.department || selectedTicket.type || 'Support Ticket'}
                </p>
              </div>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, padding: '25px' }}>
              <div className="ticket-detail-info">
              <div className="info-grid">
                <div className="info-item">
                  <label>Status</label>
                  <span 
                    className="ticket-status-badge"
                    style={{ 
                      background: getStatusColor(selectedTicket.status) + '20',
                      color: getStatusColor(selectedTicket.status),
                      border: `1px solid ${getStatusColor(selectedTicket.status)}`
                    }}
                  >
                    {selectedTicket.status || 'open'}
                  </span>
                </div>
                <div className="info-item">
                  <label>User</label>
                  <span>{selectedTicket.username || selectedTicket.userId || 'Unknown'}</span>
                </div>
                <div className="info-item">
                  <label>User ID</label>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedTicket.userId || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <label>Created</label>
                  <span>{toLocaleStringSafe(selectedTicket.createdAt)}</span>
                </div>
                <div className="info-item">
                  <label>Department</label>
                  <span>{selectedTicket.department || selectedTicket.type || 'General'}</span>
                </div>
                {selectedTicket.subject && (
                  <div className="info-item">
                    <label>Subject</label>
                    <span>{selectedTicket.subject}</span>
                  </div>
                )}
                {selectedTicket.closedAt && (
                  <div className="info-item">
                    <label>Closed</label>
                    <span>{new Date(selectedTicket.closedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              {selectedTicket.formData && Object.keys(selectedTicket.formData).length > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#dcddde' }}>
                    <FaFileAlt /> Form Data
                  </h4>
                  <div style={{ 
                    background: '#2C2F33', 
                    padding: '15px', 
                    borderRadius: '8px',
                    border: '1px solid #40444b'
                  }}>
                    {Object.entries(selectedTicket.formData).map(([key, value]) => (
                      <div key={key} style={{ 
                        display: 'flex', 
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        <strong style={{ 
                          minWidth: '150px', 
                          color: '#b9bbbe',
                          textTransform: 'capitalize'
                        }}>
                          {key}:
                        </strong>
                        <span style={{ color: '#dcddde' }}>{value || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedTicket.transcriptHtml || (selectedTicket.transcript && selectedTicket.transcript.length > 0)) ? (
                <div className="ticket-actions-bar" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  {selectedTicket.transcriptHtml && (
                    <button 
                      className="btn"
                      onClick={() => viewTranscript(selectedTicket.id)}
                      style={{ 
                        background: '#FFD700', 
                        color: '#000',
                        border: 'none'
                      }}
                    >
                      <FaEye /> View HTML Transcript
                    </button>
                  )}
                  <button 
                    className="btn btn-secondary"
                    onClick={() => exportTranscript(selectedTicket)}
                    title={selectedTicket.transcriptHtml ? 'Download HTML Transcript with full Discord styling' : 'Download Text Transcript'}
                  >
                    <FaDownload /> Download {selectedTicket.transcriptHtml ? 'HTML' : 'Text'} Transcript
                  </button>
                </div>
              ) : (
                <div className="ticket-actions-bar" style={{ marginTop: '20px' }}>
                  <div style={{ 
                    padding: '15px', 
                    background: '#2C2F33', 
                    borderRadius: '8px', 
                    border: '1px solid #faa61a',
                    color: '#faa61a',
                    textAlign: 'center'
                  }}>
                    ⚠️ Transcript will be available after the ticket is closed in Discord
                  </div>
                </div>
              )}
            </div>

            <div className="transcript-section">
              <h4>
                <FaFileAlt /> Transcript ({selectedTicket.transcript?.length || 0} messages)
              </h4>
              <div className="transcript-container">
                {selectedTicket.transcript && selectedTicket.transcript.length > 0 ? (
                  selectedTicket.transcript.map((msg, idx) => (
                    <div key={idx} className="transcript-message">
                      <div className="message-header">
                        <span className="message-author">{msg.author}</span>
                        <span className="message-timestamp">
                          {new Date(msg.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="message-content">
                        {msg.message}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#b9bbbe' }}>
                    <FaFileAlt size={32} style={{ marginBottom: '10px', opacity: 0.3 }} />
                    <p>No messages in transcript</p>
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* HTML Transcript Viewer Modal */}
      {viewingTranscript && (
        <div className="modal-overlay" onClick={() => setViewingTranscript(null)}>
          <div 
            className="modal" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '95vw', 
              width: '1400px',
              height: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="modal-header">
              <div>
                <h3>HTML Transcript</h3>
                <p style={{ color: '#b9bbbe', margin: '5px 0 0 0' }}>
                  Ticket #{viewingTranscript}
                </p>
              </div>
              <button className="close-btn" onClick={() => setViewingTranscript(null)}>×</button>
            </div>
            
            <div style={{ flex: 1, overflow: 'hidden', padding: '20px', background: '#23272A' }}>
              <iframe
                src={`/api/tickets/${viewingTranscript}/transcript/html`}
                title="Ticket Transcript"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
