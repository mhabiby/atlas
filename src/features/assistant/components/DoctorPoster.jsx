import React from 'react';
import { FaUserMd, FaHeartbeat, FaBrain, FaBaby, FaTooth, FaLungs, FaEye, FaStethoscope, FaPhone, FaCalendarCheck } from 'react-icons/fa';

const specialtyIcon = (spec='') => {
  const s = spec.toLowerCase();
  if (s.includes('cardio')) return <FaHeartbeat />;
  if (s.includes('neuro')) return <FaBrain />;
  if (s.includes('pedi')) return <FaBaby />;
  if (s.includes('derm')) return <FaStethoscope />;
  if (s.includes('dental') || s.includes('tooth')) return <FaTooth />;
  if (s.includes('pulmo') || s.includes('lung')) return <FaLungs />;
  if (s.includes('ophth') || s.includes('eye')) return <FaEye />;
  return <FaUserMd />;
};

export function DoctorPoster({ doctor }) {
  if (!doctor) {
    return (
      <div className="card poster h-100">
        <div className="doctor-placeholder">
          <div className="icon" aria-hidden>DR</div>
          <div>
            <div className="fw-semibold">No doctor selected</div>
            <div className="hint">Ask a question like <em>Find me a cardiologist</em> to populate this panel.</div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card poster h-100">
      <div className="d-flex align-items-center poster-top">
        <div className="avatar me-3 doctor-icon-avatar" aria-hidden>{specialtyIcon(doctor.specialty)}</div>
        <div>
          <div className="name">{doctor.name}</div>
          <div className="specialty">{doctor.specialty}</div>
        </div>
      </div>
      <div className="poster-body mt-3">
        <div className="availability"><strong>Availability:</strong> {doctor.availability || 'Not specified'}</div>
        <p className="bio mt-2">{doctor.one_sentence_bio || doctor.bio || 'No bio available.'}</p>
        <div className="mt-3 doctor-actions">
          <a
            className="btn btn-call"
            href={doctor.phone ? `tel:${doctor.phone}` : '#'}
            onClick={(e)=>!doctor.phone && e.preventDefault()}
          >
            <FaPhone /> <span className="label">Call</span>
          </a>
          <button
            type="button"
            className="btn btn-appointment btn-icon-only"
            aria-label="Make appointment"
            title="Make appointment"
            onClick={()=>window.alert('Appointment booking coming soon')}
          >
            <FaCalendarCheck />
          </button>
        </div>
      </div>
    </div>
  );
}
