import React, { useState, useEffect } from 'react';
import { recruitment } from '../services/api';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaBriefcase } from 'react-icons/fa';
import ConfirmDialog from '../components/ConfirmDialog';

function Recruitment() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    roles: []
  });
  
  const [newRoleName, setNewRoleName] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, positionId: null });

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await recruitment.getAll();
      setPositions(response.data);
    } catch (error) {
      toast.error('Failed to load recruitment positions');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (position = null) => {
    if (position) {
      setEditingId(position.id);
      setFormData({
        title: position.title || '',
        description: position.description || '',
        requirements: position.requirements || '',
        roles: [...(position.roles || [])]
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        requirements: '',
        roles: []
      });
    }
    setNewRoleName('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleAddRole = () => {
    if (!newRoleName.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, { name: newRoleName.trim(), status: 'closed' }]
    }));
    setNewRoleName('');
  };

  const handleRemoveRole = (index) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.filter((_, i) => i !== index)
    }));
  };

  const handleToggleRoleStatusInForm = (index) => {
    setFormData(prev => {
      const newRoles = [...prev.roles];
      newRoles[index].status = newRoles[index].status === 'open' ? 'closed' : 'open';
      return { ...prev, roles: newRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Position title is required');
      return;
    }

    try {
      if (editingId) {
        await recruitment.update(editingId, formData);
        toast.success('Position updated successfully');
      } else {
        await recruitment.create(formData);
        toast.success('Position created successfully');
      }
      handleCloseModal();
      fetchPositions();
    } catch (error) {
      toast.error(editingId ? 'Failed to update position' : 'Failed to create position');
    }
  };

  const handleQuickToggleRole = async (positionId, roleIndex) => {
    const position = positions.find(p => p.id === positionId);
    if (!position) return;
    
    const updatedRoles = [...position.roles];
    updatedRoles[roleIndex].status = updatedRoles[roleIndex].status === 'open' ? 'closed' : 'open';
    
    try {
      await recruitment.update(positionId, { roles: updatedRoles });
      toast.success(`Role ${updatedRoles[roleIndex].status === 'open' ? 'opened' : 'closed'} successfully`);
      fetchPositions();
    } catch (error) {
      toast.error('Failed to toggle role status');
    }
  };

  const handleDelete = async () => {
    try {
      await recruitment.delete(confirmDialog.positionId);
      toast.success('Position deleted successfully');
      setConfirmDialog({ isOpen: false, positionId: null });
      fetchPositions();
    } catch (error) {
      toast.error('Failed to delete position');
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="page-title">
        <div>
          <div className="page-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.8px', fontSize: '11px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>
            RealOps Portal / Management
          </div>
          <h1>
            <FaBriefcase /> Recruitment Management
          </h1>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
          <FaPlus /> New Position
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <div className="spinner"></div>
        </div>
      ) : positions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <FaBriefcase style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Positions Found</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create a position listing to start recruiting staff.</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <FaPlus /> Create First Position
          </button>
        </div>
      ) : (
        <div className="grid grid-2" style={{ gap: '24px' }}>
          {positions.map(position => (
            <div key={position.id} className="card" style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{position.title}</h3>
                  <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {position.description || 'No description provided.'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => handleOpenModal(position)}>
                    Edit
                  </button>
                  <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setConfirmDialog({ isOpen: true, positionId: position.id })}>
                    Delete
                  </button>
                </div>
              </div>
              
              <div style={{ padding: '20px', background: 'var(--bg-tertiary)', flexGrow: 1 }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)' }}>
                  Roles within this Position
                </h4>
                {position.roles && position.roles.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {position.roles.map((role, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-secondary)' }}>
                        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>{role.name}</span>
                        <button
                          onClick={() => handleQuickToggleRole(position.id, idx)}
                          className={role.status === 'open' ? "badge badge-success" : "badge badge-warning"}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', border: 'none', fontFamily: 'inherit' }}
                        >
                          {role.status === 'open' ? <><FaCheck style={{ fontSize: '10px' }} /> OPEN</> : <><FaTimes style={{ fontSize: '10px' }} /> CLOSED</>}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '0', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No roles defined for this position.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '95%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Position' : 'Create New Position'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="modal-body">
              <form id="position-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Position Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="form-input"
                    placeholder="e.g. Event Staff, Development Team"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="form-textarea"
                    placeholder="Brief description of this position category..."
                    rows={3}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Requirements (One per line)</label>
                  <textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    className="form-textarea"
                    style={{ fontFamily: 'monospace', fontSize: '13px' }}
                    placeholder="- Must be 16 years of age or older&#10;- Must have a working microphone"
                    rows={4}
                  />
                </div>
                
                <div className="form-group" style={{ marginBottom: '0' }}>
                  <label className="form-label">Specific Roles within Position</label>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddRole(); } }}
                      className="form-input"
                      placeholder="e.g. Convoy Controller, Backend Developer"
                      style={{ marginBottom: '0' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="btn"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      Add Role
                    </button>
                  </div>
                  
                  {formData.roles.length > 0 ? (
                    <div style={{ border: '1px solid var(--border-secondary)', borderRadius: '8px', padding: '12px', background: 'var(--bg-tertiary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.roles.map((role, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-secondary)' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{role.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <button
                                type="button"
                                onClick={() => handleToggleRoleStatusInForm(idx)}
                                className={role.status === 'open' ? "badge badge-success" : "badge badge-warning"}
                                style={{ cursor: 'pointer', border: 'none', padding: '4px 8px', fontSize: '10px', fontFamily: 'inherit' }}
                              >
                                {role.status === 'open' ? 'OPEN' : 'CLOSED'}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveRole(idx)}
                                style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', padding: '2px' }}
                              >
                                <FaTimes />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p style={{ margin: '0', fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>No specific roles added yet. Add at least one role.</p>
                  )}
                </div>
              </form>
            </div>
            
            <div className="modal-footer" style={{ borderTop: '1px solid var(--border-secondary)', padding: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={handleCloseModal} className="btn">
                Cancel
              </button>
              <button type="submit" form="position-form" className="btn btn-primary">
                {editingId ? 'Save Changes' : 'Create Position'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Position"
        message="Are you sure you want to delete this position? This action cannot be undone and will immediately remove it from the public website."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, positionId: null })}
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}

export default Recruitment;
