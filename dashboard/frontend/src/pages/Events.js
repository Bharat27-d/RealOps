import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaPaperPlane, FaCalendar, 
  FaClock, FaBell, FaCopy, FaLock, FaArchive,
  FaGripVertical, FaList, FaTable, FaCalendarAlt,
  FaCheckCircle, FaChevronLeft, FaChevronRight, FaUsers, FaComments
} from 'react-icons/fa';
import { events, discord } from '../services/api';
import ConfirmDialog from '../components/ConfirmDialog';
import './Events.css';

function Events() {
  // View states
  const [activeView, setActiveView] = useState('overview');
  const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  
  // Data states
  const [channels, setChannels] = useState([]);
  const [roles, setRoles] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [truckerMpData, setTruckerMpData] = useState(null);
  const [channelSearch, setChannelSearch] = useState('');
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [scenarioChannelSearch, setScenarioChannelSearch] = useState('');
  const [showScenarioChannelDropdown, setShowScenarioChannelDropdown] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, eventId: null });
  
  // Scenario Pack states
  const [scenarios, setScenarios] = useState([
    { id: 1, title: 'Scenario 1', description: '', image: '', color: '#00b894', required: true, collapsed: false },
    { id: 2, title: 'Scenario 2', description: '', image: '', color: '#00b894', required: true, collapsed: false },
    { id: 3, title: 'Scenario 3', description: '', image: '', color: '#00b894', required: true, collapsed: false },
    { id: 4, title: 'Scenario 4', description: '', image: '', color: '#00b894', required: true, collapsed: false }
  ]);
  const [header, setHeader] = useState({
    title: 'Real Ops Event Scenarios',
    description: 'Our planning team have completed the scenarios for your event, please look over these and let us know if you would like any changes.',
    color: '#5865F2',
    logo: 'https://i.ibb.co/FMYFdhk/real-ops-group-logo.png',
    footer: 'Real Ops Event Planning Team'
  });
  const [scenarioChannel, setScenarioChannel] = useState('');
  const [scenarioUser, setScenarioUser] = useState('');

  // Event Announcement states
  const [announcement, setAnnouncement] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    image: '',
    color: '#e31616ff',
    channelId: '',
    schedule: false,
    scheduleTime: '',
    reminder: false,
    reminderTime: '30',
    truckerMpLink: '',
    spreadsheetLink: '',
    profileLink: '',
    roles: []
  });

  // Timeline view state
  const [timelineView, setTimelineView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Add to Calendar state
  const [showAddToCalendar, setShowAddToCalendar] = useState(false);
  const [calendarEventLink, setCalendarEventLink] = useState('');
  const [calendarEventData, setCalendarEventData] = useState(null);

  useEffect(() => {
    fetchChannels();
    fetchRoles();
    fetchEvents();
    
    // Close dropdowns when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.form-group')) {
        setShowChannelDropdown(false);
        setShowScenarioChannelDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await discord.getChannels();
      setChannels(response.data);
    } catch (error) {
      toast.error('Failed to load channels');
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await discord.getRoles();
      setRoles(response.data);
    } catch (error) {
      toast.error('Failed to load roles');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await events.getAll();
      setEventsList(response.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // TruckerMP Integration
  const fetchTruckerMpEvent = async (eventLink) => {
    try {
      const match = eventLink.match(/events\/(\d+)/);
      if (!match) {
        toast.error('Invalid TruckerMP event link');
        return null;
      }
      const eventId = match[1];
      console.log('Fetching TruckerMP event:', eventId);
      
      // Use backend proxy to avoid CORS issues
      const response = await events.getTruckerMpEvent(eventId);
      console.log('TruckerMP data:', response.data);
      
      if (response.data.response) {
        const eventData = response.data.response;
        setTruckerMpData(eventData);
        
        // Auto-fill announcement fields
        setAnnouncement(prev => ({
          ...prev,
          title: eventData.name,
          description: `**Server:** ${eventData.server?.name || 'N/A'}\n**Game:** ${eventData.game || 'N/A'}\n**Departure:** ${eventData.departure?.city || 'N/A'}\n**Arrival:** ${eventData.arrive?.city || 'N/A'}`,
          image: eventData.map || '',
          date: eventData.start_at ? new Date(eventData.start_at).toISOString().split('T')[0] : '',
          time: eventData.start_at ? new Date(eventData.start_at).toISOString().split('T')[1].substring(0, 5) : ''
        }));
        toast.success('Event data loaded from TruckerMP!');
        return eventData;
      } else if (response.data.error) {
        toast.error(`TruckerMP API Error: ${response.data.error}`);
        return null;
      }
      toast.error('Event not found in TruckerMP');
      return null;
    } catch (error) {
      console.error('TruckerMP fetch error:', error);
      toast.error(`Failed to fetch TruckerMP event: ${error.response?.data?.error || error.message}`);
      return null;
    }
  };

  // Scenario Pack handlers
  const addScenario = () => {
    const newId = Math.max(...scenarios.map(s => s.id), 0) + 1;
    setScenarios([...scenarios, {
      id: newId,
      title: `Scenario ${scenarios.length + 1}`,
      description: '',
      image: '',
      color: '#00b894',
      required: false,
      collapsed: false
    }]);
    toast.success('Scenario added successfully');
  };

  const removeScenario = (id) => {
    const scenario = scenarios.find(s => s.id === id);
    if (scenario?.required) {
      toast.warning('Cannot remove required scenarios (1-4)');
      return;
    }
    if (scenarios.length > 4) {
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const moveScenario = (index, direction) => {
    const newScenarios = [...scenarios];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < scenarios.length) {
      [newScenarios[index], newScenarios[newIndex]] = [newScenarios[newIndex], newScenarios[index]];
      setScenarios(newScenarios);
    }
  };

  const updateScenario = (id, field, value) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const toggleScenarioCollapse = (id) => {
    setScenarios(scenarios.map(s => 
      s.id === id ? { ...s, collapsed: !s.collapsed } : s
    ));
  };

  const sendScenarios = async () => {
    if (!scenarioChannel) {
      toast.error('Please select a channel');
      return;
    }

    // Validate required scenarios (1-4)
    const requiredScenarios = scenarios.filter(s => s.required);
    const emptyRequired = requiredScenarios.filter(s => !s.description || !s.image);
    if (emptyRequired.length > 0) {
      toast.error('Please fill in descriptions and images for all required scenarios (1-4)');
      return;
    }

    // Validate optional scenarios (5-6) if they exist
    const optionalScenarios = scenarios.filter(s => !s.required);
    const partialOptional = optionalScenarios.filter(s => (s.description && !s.image) || (!s.description && s.image));
    if (partialOptional.length > 0) {
      toast.error('Optional scenarios must have both description AND image, or leave both empty');
      return;
    }

    setLoading(true);
    try {
      // Only send scenarios that have both description and image
      const validScenarios = scenarios.filter(s => s.description && s.image);

      await events.create({
        type: 'scenario_pack',
        channelId: scenarioChannel,
        userId: scenarioUser,
        scenarios: validScenarios.map(s => ({
          title: s.title,
          description: s.description,
          image: s.image,
          color: s.color
        })),
        header
      });

      toast.success('Scenarios sent successfully!');
      setShowScenarioBuilder(false);
      
      // Reset form to 4 required scenarios
      setScenarios([
        { id: 1, title: 'Scenario 1', description: '', image: '', color: '#00b894', required: true },
        { id: 2, title: 'Scenario 2', description: '', image: '', color: '#00b894', required: true },
        { id: 3, title: 'Scenario 3', description: '', image: '', color: '#00b894', required: true },
        { id: 4, title: 'Scenario 4', description: '', image: '', color: '#00b894', required: true }
      ]);
      setScenarioChannel('');
      setScenarioUser('');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to send scenarios');
    } finally {
      setLoading(false);
    }
  };

  // Event Announcement handlers
  const createAnnouncement = async () => {
    if (!announcement.title || !announcement.description) {
      toast.error('Please fill in title and description');
      return;
    }
    if (!announcement.channelId) {
      toast.error('Please select a channel');
      return;
    }

    setLoading(true);
    try {
      await events.create({
        type: 'announcement',
        ...announcement,
        scheduleTime: announcement.schedule ? announcement.scheduleTime : null,
        truckerMpData: truckerMpData,
        roles: announcement.roles
      });

      toast.success(announcement.schedule ? 'Event scheduled successfully!' : 'Event announced successfully!');
      setShowAnnouncementModal(false);
      
      // Reset form
      setAnnouncement({
        title: '',
        description: '',
        date: '',
        time: '',
        image: '',
        color: '#5865F2',
        channelId: '',
        schedule: false,
        scheduleTime: '',
        reminder: false,
        reminderTime: '30',
        truckerMpLink: '',
        spreadsheetLink: '',
        profileLink: '',
        roles: []
      });
      setTruckerMpData(null);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  // Timeline handlers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDate = (date) => {
    return eventsList.filter(event => {
      // Only show calendar events, not announcements
      if (event.type === 'announcement') return false;
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const deleteEvent = (eventId) => {
    setConfirmDialog({ isOpen: true, eventId });
  };

  const confirmDeleteEvent = async () => {
    try {
      await events.delete(confirmDialog.eventId);
      toast.success('Event deleted successfully');
      setConfirmDialog({ isOpen: false, eventId: null });
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
      setConfirmDialog({ isOpen: false, eventId: null });
    }
  };

  const duplicateEvent = async (event) => {
    try {
      const { id, messageId, createdAt, createdBy, ...eventData } = event;
      await events.create({
        ...eventData,
        title: `${event.title} (Copy)`
      });
      toast.success('Event duplicated successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error duplicating event:', error);
      toast.error('Failed to duplicate event');
    }
  };

  // Add event to calendar from TruckerMP
  const fetchCalendarEvent = async () => {
    if (!calendarEventLink) {
      toast.error('Please enter a TruckerMP event link');
      return;
    }

    try {
      const match = calendarEventLink.match(/events\/(\d+)/);
      if (!match) {
        toast.error('Invalid TruckerMP event link');
        return;
      }
      const eventId = match[1];
      
      const response = await events.getTruckerMpEvent(eventId);
      if (response.data.response) {
        setCalendarEventData(response.data.response);
        toast.success('Event loaded from TruckerMP!');
      } else {
        toast.error('Event not found');
      }
    } catch (error) {
      toast.error('Failed to fetch event');
    }
  };

  const addToCalendar = async () => {
    if (!calendarEventData) {
      toast.error('Please fetch an event first');
      return;
    }

    setLoading(true);
    try {
      await events.create({
        type: 'calendar_event',
        title: calendarEventData.name,
        description: `Server: ${calendarEventData.server?.name || 'N/A'}\nGame: ${calendarEventData.game || 'N/A'}\nDeparture: ${calendarEventData.departure?.city || 'N/A'}\nArrival: ${calendarEventData.arrive?.city || 'N/A'}`,
        date: calendarEventData.start_at ? new Date(calendarEventData.start_at).toISOString().split('T')[0] : null,
        time: calendarEventData.start_at ? new Date(calendarEventData.start_at).toISOString().split('T')[1].substring(0, 5) : null,
        image: calendarEventData.map || '',
        color: '#3498db',
        truckerMpData: calendarEventData,
        reminder: announcement.reminder,
        reminderTime: '120' // 2 hours before in minutes
      });
      
      toast.success(announcement.reminder ? 'Event added to calendar with 2-hour reminder!' : 'Event added to calendar!');
      setShowAddToCalendar(false);
      setCalendarEventLink('');
      setCalendarEventData(null);
      setAnnouncement({...announcement, reminder: false});
      fetchEvents();
    } catch (error) {
      toast.error('Failed to add event to calendar');
    } finally {
      setLoading(false);
    }
  };

  // Copy TruckerMP link from calendar event
  const copyEventLink = (event) => {
    if (event.truckerMpData && event.truckerMpData.id) {
      const link = `https://truckersmp.com/events/${event.truckerMpData.id}`;
      navigator.clipboard.writeText(link);
      toast.success('TruckerMP link copied to clipboard!');
    } else {
      toast.error('No TruckerMP link available for this event');
    }
  };

  // Open announcement modal with calendar event pre-filled
  const announceCalendarEvent = async (event) => {
    if (event.truckerMpData) {
      setTruckerMpData(event.truckerMpData);
      setAnnouncement({
        title: event.title,
        description: event.description,
        date: event.date || '',
        time: event.time || '',
        image: event.image || '',
        color: event.color || '#5865F2',
        channelId: '',
        schedule: false,
        scheduleTime: '',
        reminder: false,
        reminderTime: '30',
        truckerMpLink: `https://truckersmp.com/events/${event.truckerMpData.id}`,
        spreadsheetLink: '',
        profileLink: '',
        roles: []
      });
      setShowAnnouncementModal(true);
      // Stay on timeline page - modal will open here
    } else {
      toast.error('No TruckerMP data available for this event');
    }
  };

  const postStaffAvailability = async (event) => {
    if (!event.truckerMpData) {
      toast.error('No TruckerMP data available for this event');
      return;
    }

    const eventLink = `https://truckersmp.com/events/${event.truckerMpData.id}`;
    
    try {
      setLoading(true);
      await discord.postStaffAvailability({ eventLink });
      toast.success('Staff availability check posted successfully!');
    } catch (error) {
      console.error('Error posting staff availability:', error);
      toast.error(error.response?.data?.error || 'Failed to post staff availability');
    } finally {
      setLoading(false);
    }
  };

  // Render Overview
  const renderOverview = () => (
    <div className="events-overview">
      <div className="feature-cards">
        <div className="feature-card" onClick={() => setShowScenarioBuilder(true)}>
          <div className="feature-icon">
            <FaList />
          </div>
          <h3>Scenario Pack System</h3>
          <p>Create 4-6 scenario embeds with custom header and footer (matches /realopsscenarios command)</p>
          <button className="btn btn-primary"><FaPlus /> Create Pack</button>
        </div>

        <div className="feature-card" onClick={() => setActiveView('timeline')}>
          <div className="feature-icon">
            <FaCalendar />
          </div>
          <h3>Event Timeline</h3>
          <p>Visual calendar view with event announcements and management (matches /staff-resources command)</p>
          <button className="btn btn-primary"><FaCalendarAlt /> View Timeline</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '30px' }}>
        <h2>Upcoming Events</h2>
        <div className="events-list">
          {eventsList
            .filter(event => {
              const eventDate = event.date ? new Date(event.date) : null;
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return eventDate && eventDate >= today;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 4)
            .map(event => (
            <div key={event.id} className="event-item">
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                {event.image && (
                  <img src={event.image} alt={event.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1 }}>
                  <h4>{event.title}</h4>
                  <p style={{ color: '#aaa', fontSize: '14px', marginTop: '5px' }}>{event.description?.substring(0, 100)}...</p>
                  {event.date && <span className="badge">{new Date(event.date).toLocaleDateString()}</span>}
                  {event.createdAt && !event.date && <span className="badge">{new Date(event.createdAt).toLocaleDateString()}</span>}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-sm btn-outline" onClick={() => duplicateEvent(event)}>
                    <FaCopy />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteEvent(event.id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {eventsList.filter(event => {
            const eventDate = event.date ? new Date(event.date) : null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return eventDate && eventDate >= today;
          }).length === 0 && (
            <p style={{ textAlign: 'center', color: '#aaa', padding: '40px 0' }}>No upcoming events scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Render Timeline View
  const renderTimeline = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(selectedDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const prevMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
    const nextMonth = () => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
    
    return (
      <div className="timeline-view">
        <div className="timeline-header">
          <div className="view-switcher">
            <button className={timelineView === 'month' ? 'active' : ''} onClick={() => setTimelineView('month')}>
              <FaTable /> Month
            </button>
            <button className={timelineView === 'week' ? 'active' : ''} onClick={() => setTimelineView('week')}>
              <FaList /> Week
            </button>
            <button className={timelineView === 'day' ? 'active' : ''} onClick={() => setTimelineView('day')}>
              <FaCalendar /> Day
            </button>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => setShowAddToCalendar(true)}>
              <FaPlus /> Add Event
            </button>
            <button className="btn btn-outline" onClick={() => setActiveView('overview')}>
              Back to Overview
            </button>
          </div>
        </div>

        {timelineView === 'month' && (
          <div className="calendar-container">
            <div className="calendar-nav">
              <button onClick={prevMonth}><FaChevronLeft /></button>
              <h2>{monthNames[month]} {year}</h2>
              <button onClick={nextMonth}><FaChevronRight /></button>
            </div>

            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              {[...Array(startingDayOfWeek)].map((_, i) => (
                <div key={`empty-${i}`} className="calendar-day empty"></div>
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const currentDate = new Date(year, month, day);
                const dayEvents = getEventsForDate(currentDate);
                const isToday = currentDate.toDateString() === new Date().toDateString();
                
                return (
                  <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    <div className="day-number">{day}</div>
                    {dayEvents.map(event => (
                      <div 
                        key={event.id} 
                        className="calendar-event" 
                        style={{ 
                          borderLeft: `3px solid ${event.color || '#5865F2'}`,
                          cursor: 'pointer',
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                          {event.title}
                          {event.reminder && <FaBell style={{ marginLeft: '5px', fontSize: '10px', color: '#FFD700' }} title="Reminder enabled" />}
                        </div>
                        {event.time && <div style={{ fontSize: '10px', color: '#aaa' }}>{event.time}</div>}
                        {event.truckerMpData && (
                          <div style={{ display: 'flex', gap: '5px', marginTop: '5px', flexWrap: 'wrap' }}>
                            <button 
                              className="btn btn-sm btn-outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyEventLink(event);
                              }}
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              title="Copy TruckerMP Link"
                            >
                              <FaCopy />
                            </button>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                announceCalendarEvent(event);
                              }}
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              title="Announce Event"
                            >
                              <FaBell />
                            </button>
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={(e) => {
                                e.stopPropagation();
                                postStaffAvailability(event);
                              }}
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              title="Staff Availability"
                            >
                              <FaUsers />
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEvent(event.id);
                              }}
                              style={{ padding: '2px 6px', fontSize: '10px' }}
                              title="Delete Event"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="card-header">
        <h1>Event Management</h1>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowScenarioBuilder(true)}>
            <FaPlus /> Scenario Pack
          </button>
          <button className="btn btn-primary" onClick={() => setShowAnnouncementModal(true)}>
            <FaPlus /> Announcement
          </button>
          <button className="btn btn-outline" onClick={() => setActiveView('timeline')}>
            <FaCalendar /> Timeline
          </button>
        </div>
      </div>

      {activeView === 'overview' && renderOverview()}
      {activeView === 'timeline' && renderTimeline()}

      {/* Scenario Pack Builder Modal */}
      {showScenarioBuilder && (
        <div className="modal-overlay" onClick={() => setShowScenarioBuilder(false)}>
          <div className="modal" style={{ maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Scenario Pack Builder</h3>
              <button className="close-btn" onClick={() => setShowScenarioBuilder(false)}>×</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div className="scenario-header-config">
              <h4>Header Settings</h4>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={header.title}
                  onChange={(e) => setHeader({...header, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={header.description}
                  onChange={(e) => setHeader({...header, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Color</label>
                  <input 
                    type="color" 
                    value={header.color}
                    onChange={(e) => setHeader({...header, color: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Logo URL</label>
                  <input 
                    type="text" 
                    value={header.logo}
                    onChange={(e) => setHeader({...header, logo: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div className="form-group">
                  <label>Footer Text</label>
                  <input 
                    type="text" 
                    value={header.footer}
                    onChange={(e) => setHeader({...header, footer: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="scenarios-list">
              {scenarios.map((scenario, index) => (
                <div key={scenario.id} className="scenario-item" style={{ 
                  border: scenario.required ? '2px solid #5865F2' : '2px solid #40444b' 
                }}>
                  <div 
                    className="scenario-item-header"
                    onClick={() => toggleScenarioCollapse(scenario.id)}
                  >
                    <h4>
                      <FaGripVertical /> 
                      {scenario.title}
                      {scenario.required && (
                        <span style={{ color: '#5865F2' }}>REQUIRED</span>
                      )}
                      {!scenario.required && (
                        <span style={{ color: '#00b894' }}>OPTIONAL</span>
                      )}
                    </h4>
                    <div className="scenario-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => moveScenario(index, 'up')}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        <FaArrowUp />
                      </button>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => moveScenario(index, 'down')}
                        disabled={index === scenarios.length - 1}
                        title="Move Down"
                      >
                        <FaArrowDown />
                      </button>
                      {!scenario.required && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => removeScenario(scenario.id)}
                          title="Remove Scenario"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  {!scenario.collapsed && (
                    <div className="scenario-item-body">
                      <div className="form-group">
                        <label>
                          Description *
                          {scenario.required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
                        </label>
                        <textarea 
                          value={scenario.description}
                          onChange={(e) => updateScenario(scenario.id, 'description', e.target.value)}
                          placeholder={scenario.required ? "Enter scenario description..." : "Leave empty to skip this scenario"}
                          rows={4}
                          required={scenario.required}
                          style={{
                            background: '#1e2124',
                            border: '2px solid #40444b',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#dcddde',
                            fontSize: '14px',
                            lineHeight: '1.5',
                            resize: 'vertical',
                            width: '100%',
                            fontFamily: 'inherit'
                          }}
                        />
                      </div>

                      <div className="grid grid-2">
                        <div className="form-group">
                          <label>
                            Image URL *
                            {scenario.required && <span style={{ color: '#e74c3c', marginLeft: '4px' }}>*</span>}
                          </label>
                          <input 
                            type="text"
                            value={scenario.image}
                            onChange={(e) => updateScenario(scenario.id, 'image', e.target.value)}
                            placeholder={scenario.required ? "https://... (must be valid image URL)" : "https://... or leave empty"}
                            required={scenario.required}
                            style={{
                              background: '#1e2124',
                              border: '2px solid #40444b',
                              borderRadius: '8px',
                              padding: '12px',
                              color: '#dcddde',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label>Color</label>
                          <input 
                            type="color"
                            value={scenario.color}
                            onChange={(e) => updateScenario(scenario.id, 'color', e.target.value)}
                            style={{
                              height: '48px',
                              width: '100%',
                              cursor: 'pointer',
                              border: '2px solid #40444b',
                              borderRadius: '8px',
                              padding: '4px'
                            }}
                          />
                        </div>
                      </div>

                      {scenario.image && (
                        <img 
                          src={scenario.image} 
                          alt="Preview" 
                          className="scenario-image-preview"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              className="btn" 
              onClick={addScenario} 
              style={{ 
                marginBottom: '24px', 
                width: '100%',
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#000',
                fontWeight: '600',
                padding: '14px 24px',
                fontSize: '15px',
                border: 'none',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 215, 0, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
              }}
            >
              <FaPlus style={{ marginRight: '8px' }} /> 
              Add Optional Scenario ({scenarios.length})
            </button>

            <div className="grid grid-2" style={{ marginBottom: '20px' }}>
              <div className="form-group">
                <label>Send to Channel *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={scenarioChannel ? channels.find(c => c.id === scenarioChannel)?.name || '' : scenarioChannelSearch}
                    onChange={(e) => {
                      setScenarioChannelSearch(e.target.value);
                      setShowScenarioChannelDropdown(true);
                      if (!e.target.value) {
                        setScenarioChannel('');
                      }
                    }}
                    onFocus={() => setShowScenarioChannelDropdown(true)}
                    placeholder="Search for a channel..."
                    required
                  />
                  {showScenarioChannelDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      background: '#2C2F33',
                      border: '1px solid #40444b',
                      borderRadius: '4px',
                      marginTop: '4px',
                      zIndex: 1000,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {channels
                        .filter(channel => channel.name.toLowerCase().includes(scenarioChannelSearch.toLowerCase()))
                        .map(channel => (
                          <div
                            key={channel.id}
                            onClick={() => {
                              setScenarioChannel(channel.id);
                              setScenarioChannelSearch('');
                              setShowScenarioChannelDropdown(false);
                            }}
                            style={{
                              padding: '10px 15px',
                              cursor: 'pointer',
                              background: scenarioChannel === channel.id ? '#5865F2' : 'transparent',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              if (scenarioChannel !== channel.id) {
                                e.target.style.background = '#40444b';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (scenarioChannel !== channel.id) {
                                e.target.style.background = 'transparent';
                              }
                            }}
                          >
                            # {channel.name}
                          </div>
                        ))}
                      {channels.filter(channel => channel.name.toLowerCase().includes(scenarioChannelSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding: '10px 15px', color: '#aaa', textAlign: 'center' }}>
                          No channels found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Mention User ID (Optional)</label>
                <input 
                  type="text"
                  value={scenarioUser}
                  onChange={(e) => setScenarioUser(e.target.value)}
                  placeholder="Discord User ID"
                  style={{
                    background: '#1e2124',
                    border: '2px solid #40444b',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#dcddde',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              marginTop: '24px',
              paddingTop: '24px',
              borderTop: '2px solid #40444b'
            }}>
              <button 
                className="btn" 
                onClick={sendScenarios} 
                disabled={loading} 
                style={{ 
                  flex: 1,
                  background: loading ? '#40444b' : 'linear-gradient(135deg, #FFD700, #FFA500)',
                  color: loading ? '#72767d' : '#000',
                  fontWeight: '600',
                  padding: '14px 24px',
                  fontSize: '15px',
                  border: 'none',
                  boxShadow: loading ? 'none' : '0 4px 12px rgba(255, 215, 0, 0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <FaPaperPlane style={{ marginRight: '8px' }} /> 
                {loading ? 'Sending...' : 'Send Scenarios'}
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => setShowScenarioBuilder(false)}
                style={{
                  padding: '14px 32px',
                  fontSize: '15px',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Event Announcement</h3>
              <button className="close-btn" onClick={() => setShowAnnouncementModal(false)}>×</button>
            </div>

            <div className="form-group" style={{ background: '#2C2F33', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <label>🚛 TruckerMP Event Link (Optional - Auto-fills fields)</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text"
                  value={announcement.truckerMpLink}
                  onChange={(e) => setAnnouncement({...announcement, truckerMpLink: e.target.value})}
                  placeholder="https://truckersmp.com/events/12345"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => fetchTruckerMpEvent(announcement.truckerMpLink)}
                  disabled={!announcement.truckerMpLink}
                >
                  Fetch
                </button>
              </div>
              {truckerMpData && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#23272A', borderRadius: '4px', fontSize: '12px' }}>
                  ✅ Event loaded: <strong>{truckerMpData.name}</strong><br />
                  📅 Start: {new Date(truckerMpData.start_at).toUTCString()}<br />
                  {truckerMpData.meetup_at && `🕐 Meetup: ${new Date(truckerMpData.meetup_at).toUTCString()}`}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Event Title * {truckerMpData && '(Auto-filled from TruckerMP)'}</label>
              <input 
                type="text"
                value={announcement.title}
                onChange={(e) => setAnnouncement({...announcement, title: e.target.value})}
                placeholder={truckerMpData ? "Auto-filled from TruckerMP" : "Enter event title or fetch from TruckerMP..."}
                required
                readOnly={!!truckerMpData}
                style={{ background: truckerMpData ? '#1a1d21' : undefined, cursor: truckerMpData ? 'not-allowed' : 'text' }}
              />
            </div>

            <div className="form-group">
              <label>Description * {truckerMpData && '(Auto-filled from TruckerMP - Editable)'}</label>
              <textarea 
                value={announcement.description}
                onChange={(e) => setAnnouncement({...announcement, description: e.target.value})}
                placeholder={truckerMpData ? "Auto-filled from TruckerMP" : "Enter event description or fetch from TruckerMP..."}
                rows={5}
                required
              />
            </div>

            {truckerMpData && (
              <>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label>Spreadsheet Link (Optional)</label>
                    <input 
                      type="text"
                      value={announcement.spreadsheetLink}
                      onChange={(e) => setAnnouncement({...announcement, spreadsheetLink: e.target.value})}
                      placeholder="Google Sheets link..."
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Link (Optional)</label>
                    <input 
                      type="text"
                      value={announcement.profileLink}
                      onChange={(e) => setAnnouncement({...announcement, profileLink: e.target.value})}
                      placeholder="Profile/registration link..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tag Roles (Optional - Max 2)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                    {roles.map(role => (
                      <label key={role.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '8px 12px', 
                        background: announcement.roles.includes(role.id) ? '#5865F2' : '#2C2F33', 
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}>
                        <input 
                          type="checkbox"
                          checked={announcement.roles.includes(role.id)}
                          onChange={(e) => {
                            if (e.target.checked && announcement.roles.length < 2) {
                              setAnnouncement({...announcement, roles: [...announcement.roles, role.id]});
                            } else if (!e.target.checked) {
                              setAnnouncement({...announcement, roles: announcement.roles.filter(r => r !== role.id)});
                            } else {
                              toast.warning('Maximum 2 roles can be tagged');
                            }
                          }}
                          style={{ width: 'auto', margin: 0 }}
                        />
                        <span style={{ color: role.color || '#fff' }}>{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Channel *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={announcement.channelId ? channels.find(c => c.id === announcement.channelId)?.name || '' : channelSearch}
                  onChange={(e) => {
                    setChannelSearch(e.target.value);
                    setShowChannelDropdown(true);
                    if (!e.target.value) {
                      setAnnouncement({...announcement, channelId: ''});
                    }
                  }}
                  onFocus={() => setShowChannelDropdown(true)}
                  placeholder="Search for a channel..."
                  required
                />
                {showChannelDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    background: '#2C2F33',
                    border: '1px solid #40444b',
                    borderRadius: '4px',
                    marginTop: '4px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                  }}>
                    {channels
                      .filter(channel => channel.name.toLowerCase().includes(channelSearch.toLowerCase()))
                      .map(channel => (
                        <div
                          key={channel.id}
                          onClick={() => {
                            setAnnouncement({...announcement, channelId: channel.id});
                            setChannelSearch('');
                            setShowChannelDropdown(false);
                          }}
                          style={{
                            padding: '10px 15px',
                            cursor: 'pointer',
                            background: announcement.channelId === channel.id ? '#5865F2' : 'transparent',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (announcement.channelId !== channel.id) {
                              e.target.style.background = '#40444b';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (announcement.channelId !== channel.id) {
                              e.target.style.background = 'transparent';
                            }
                          }}
                        >
                          # {channel.name}
                        </div>
                      ))}
                    {channels.filter(channel => channel.name.toLowerCase().includes(channelSearch.toLowerCase())).length === 0 && (
                      <div style={{ padding: '10px 15px', color: '#aaa', textAlign: 'center' }}>
                        No channels found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox"
                  checked={announcement.schedule}
                  onChange={(e) => setAnnouncement({...announcement, schedule: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                Schedule for later
              </label>
              {announcement.schedule && (
                <input 
                  type="datetime-local"
                  value={announcement.scheduleTime}
                  onChange={(e) => setAnnouncement({...announcement, scheduleTime: e.target.value})}
                  style={{ marginTop: '10px' }}
                />
              )}
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox"
                  checked={announcement.reminder}
                  onChange={(e) => setAnnouncement({...announcement, reminder: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                Send reminder before event
              </label>
              {announcement.reminder && (
                <select 
                  value={announcement.reminderTime}
                  onChange={(e) => setAnnouncement({...announcement, reminderTime: e.target.value})}
                  style={{ marginTop: '10px' }}
                >
                  <option value="15">15 minutes before</option>
                  <option value="30">30 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </select>
              )}
            </div>

            {announcement.image && (
              <img 
                src={announcement.image} 
                alt="Preview" 
                style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '20px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={createAnnouncement} disabled={loading} style={{ flex: 1 }}>
                <FaBell /> {loading ? 'Creating...' : (announcement.schedule ? 'Schedule Announcement' : 'Send Now')}
              </button>
              <button className="btn btn-outline" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add to Calendar Modal */}
      {showAddToCalendar && (
        <div className="modal-overlay" onClick={() => setShowAddToCalendar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Event to Calendar</h3>
              <button className="close-btn" onClick={() => setShowAddToCalendar(false)}>×</button>
            </div>

            <div className="form-group" style={{ background: '#2C2F33', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <label>🚛 TruckerMP Event Link</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text"
                  value={calendarEventLink}
                  onChange={(e) => setCalendarEventLink(e.target.value)}
                  placeholder="https://truckersmp.com/events/12345"
                  style={{ flex: 1 }}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={fetchCalendarEvent}
                  disabled={!calendarEventLink}
                >
                  Fetch
                </button>
              </div>
              {calendarEventData && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#23272A', borderRadius: '4px' }}>
                  <h4 style={{ marginBottom: '10px', color: '#5865F2' }}>✅ {calendarEventData.name}</h4>
                  <div style={{ fontSize: '13px', lineHeight: '1.8' }}>
                    <div><strong>Server:</strong> {calendarEventData.server?.name || 'N/A'}</div>
                    <div><strong>Game:</strong> {calendarEventData.game || 'N/A'}</div>
                    <div><strong>Departure:</strong> {calendarEventData.departure?.city || 'N/A'}</div>
                    <div><strong>Arrival:</strong> {calendarEventData.arrive?.city || 'N/A'}</div>
                    <div><strong>Start Time:</strong> {calendarEventData.start_at ? new Date(calendarEventData.start_at).toUTCString() : 'N/A'}</div>
                  </div>
                  {calendarEventData.map && (
                    <img 
                      src={calendarEventData.map} 
                      alt="Event Map" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginTop: '15px' }}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="checkbox"
                  checked={announcement.reminder}
                  onChange={(e) => setAnnouncement({...announcement, reminder: e.target.checked})}
                  style={{ width: 'auto' }}
                />
                Send reminder notification 2 hours before event
              </label>
              {announcement.reminder && (
                <div style={{ marginTop: '10px', padding: '10px', background: '#2C2F33', borderRadius: '6px', fontSize: '13px' }}>
                  <FaBell style={{ marginRight: '8px', color: '#FFD700' }} />
                  A reminder will be automatically sent to Discord 2 hours before the event starts
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-primary" 
                onClick={addToCalendar} 
                disabled={loading || !calendarEventData} 
                style={{ flex: 1 }}
              >
                <FaCalendar /> {loading ? 'Adding...' : 'Add to Calendar'}
              </button>
              <button className="btn btn-outline" onClick={() => {
                setShowAddToCalendar(false);
                setCalendarEventLink('');
                setCalendarEventData(null);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmDeleteEvent}
        onCancel={() => setConfirmDialog({ isOpen: false, eventId: null })}
      />
    </div>
  );
}

export default Events;
