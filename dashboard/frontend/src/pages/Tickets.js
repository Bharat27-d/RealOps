import React, { useState, useEffect } from 'react';
import { toLocaleStringSafe } from '../utils/dateUtils';
import { toast } from 'react-toastify';
import { 
  FaEye, FaDownload, FaUser, FaCalendar, 
  FaClock, FaTag, FaFileAlt, FaSync, FaSearch, FaTicketAlt 
} from 'react-icons/fa';
import { tickets } from '../services/api';
import './Tickets.css';

function Tickets() {
  const [ticketList, setTicketList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await tickets.getAll({ status: 'closed' });
      const closedTickets = (response.data || []).filter(ticket => 
        ticket.status === 'closed' || ticket.closedAt
      );
      
      const sorted = closedTickets.sort((a, b) => 
        new Date(b.closedAt || b.createdAt) - new Date(a.closedAt || a.createdAt)
      );
      
      setTicketList(sorted);
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
    if (ticket.transcriptHtml) {
      try {
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

  const getStatusClass = (status) => {
    switch(status) {
      case 'open': return 'badge badge-success';
      case 'pending': return 'badge badge-warning';
      case 'closed': return 'badge badge-danger';
      default: return 'badge badge-primary';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Loading archived tickets and transcripts...</p>
      </div>
    );
  }

  return (
    <div className="tickets-container">
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Management
          </div>
          <h1>
            <FaTicketAlt /> Closed Ticket Archive
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            {ticketList.length} Archived
          </span>
          <button className="btn btn-outline" onClick={fetchTickets}>
            <FaSync /> Sync Transcripts
          </button>
        </div>
      </div>

      {/* Search Bar Card */}
      <div className="card" style={{ padding: '18px 24px', marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <FaSearch style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-tertiary)' 
          }} />
          <input
            type="text"
            placeholder="Search tickets by ID, username, subject, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ 
              paddingLeft: '44px',
              fontSize: '14px',
              background: 'var(--bg-tertiary)'
            }}
          />
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="tickets-grid">
        {filteredTickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaTag style={{ color: 'var(--primary)' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: '600' }}>#{ticket.id?.slice(0, 18) || 'N/A'}</h4>
                  <p style={{ margin: '2px 0 0 0', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                    {ticket.department || ticket.type || 'Support'}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {ticket.transcriptHtml && (
                  <span className="badge badge-primary" style={{ fontSize: '10px' }} title="HTML transcript available">
                    HTML
                  </span>
                )}
                <span className={getStatusClass(ticket.status)}>
                  {ticket.status || 'open'}
                </span>
              </div>
            </div>

            <div className="ticket-card-body">
              {ticket.subject && (
                <div className="ticket-info-row">
                  <FaFileAlt />
                  <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{ticket.subject}</span>
                </div>
              )}
              <div className="ticket-info-row">
                <FaUser />
                <span>{ticket.username || ticket.userId || 'Unknown User'}</span>
              </div>
              <div className="ticket-info-row">
                <FaCalendar />
                <span>{toLocaleStringSafe(ticket.createdAt).split(',')[0]}</span>
              </div>
              <div className="ticket-info-row">
                <FaClock />
                <span>{toLocaleStringSafe(ticket.createdAt).split(',')[1]}</span>
              </div>
              {ticket.transcript && ticket.transcript.length > 0 && (
                <div className="ticket-info-row">
                  <FaFileAlt />
                  <span>{ticket.transcript.length} messages in log</span>
                </div>
              )}
            </div>

            <div className="ticket-card-actions">
              <button 
                className="btn btn-outline" 
                onClick={() => viewTicket(ticket.id)}
              >
                <FaEye /> View Log
              </button>
              {(ticket.transcriptHtml || (ticket.transcript && ticket.transcript.length > 0)) && (
                <button 
                  className="btn btn-secondary" 
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
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
          <FaTag size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
          <p style={{ fontSize: '18px', color: 'var(--text-primary)', fontWeight: '600', marginBottom: '8px' }}>No Archived Tickets Found</p>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {searchQuery ? 'Try adjusting or clearing your search filter query.' : 'Closed support tickets will appear here with full downloadable chat logs.'}
          </p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="modal-overlay" onClick={() => setSelectedTicket(null)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaTicketAlt /> Ticket #{selectedTicket.id}
              </h2>
              <button className="close-btn" onClick={() => setSelectedTicket(null)}>×</button>
            </div>
            
            <div>
              <div className="ticket-detail-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>User</label>
                    <span>{selectedTicket.username || selectedTicket.userId || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <label>User ID</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{selectedTicket.userId || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Created Timestamp</label>
                    <span>{toLocaleStringSafe(selectedTicket.createdAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Closed Timestamp</label>
                    <span>{toLocaleStringSafe(selectedTicket.closedAt)}</span>
                  </div>
                  <div className="info-item">
                    <label>Department Category</label>
                    <span>{selectedTicket.department || selectedTicket.type || 'General Support'}</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span style={{ textTransform: 'uppercase', color: 'var(--danger)' }}>Closed</span>
                  </div>
                </div>

                {selectedTicket.formData && Object.keys(selectedTicket.formData).length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaFileAlt style={{ color: 'var(--primary)' }} /> Form Submission Answers
                    </h4>
                    <div style={{ 
                      background: 'var(--bg-tertiary)', 
                      padding: '16px 20px', 
                      borderRadius: '12px',
                      border: '1px solid var(--border-secondary)'
                    }}>
                      {Object.entries(selectedTicket.formData).map(([key, value]) => (
                        <div key={key} style={{ 
                          display: 'flex', 
                          marginBottom: '10px',
                          fontSize: '14px'
                        }}>
                          <strong style={{ 
                            minWidth: '160px', 
                            color: 'var(--text-secondary)',
                            textTransform: 'capitalize'
                          }}>
                            {key}:
                          </strong>
                          <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{value || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedTicket.transcriptHtml || (selectedTicket.transcript && selectedTicket.transcript.length > 0)) && (
                  <div className="ticket-actions-bar" style={{ marginTop: '24px' }}>
                    <button 
                      className="btn"
                      onClick={() => exportTranscript(selectedTicket)}
                      title="Download full chat log"
                    >
                      <FaDownload /> Download Complete Transcript Log
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
