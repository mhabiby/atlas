import React, { useState, useMemo } from 'react';
import { FaUserMd, FaHeartbeat, FaBrain, FaBaby, FaTooth, FaLungs, FaEye, FaStethoscope, FaPhone, FaCalendarCheck, FaCheckCircle, FaLanguage, FaStar } from 'react-icons/fa';

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

function deriveStatus(avail=''){
  const t = (avail||'').toLowerCase();
  if(!t) return { label:'Unknown', variant:'unknown' };
  if(t.includes('now') || t.includes('today')) return { label:'Available now', variant:'now' };
  if(t.includes('tomorrow')) return { label:'Tomorrow', variant:'soon' };
  if(t.includes('next') || t.includes('book')) return { label:avail, variant:'book' };
  return { label:avail, variant:'default' };
}

export function DoctorPoster({ doctor }) {
  if (!doctor) {
    return (
      <div className="card poster h-100 poster-empty" aria-labelledby="poster-empty-heading">
        <div className="doctor-placeholder">
          <div className="icon" aria-hidden>DR</div>
          <div>
            <div id="poster-empty-heading" className="fw-semibold">No doctor selected</div>
            <div className="hint">Ask something like <em>Find me a cardiologist</em> to populate this panel.</div>
          </div>
        </div>
      </div>
    );
  }

  const status = deriveStatus(doctor.availability);
  const rating = doctor.rating || doctor.stars || null; // expected 0-5 float
  const reviews = doctor.reviews_count || doctor.reviews || null;
  const experienceYears = doctor.years_experience || doctor.experience_years || null;
  const languages = doctor.languages || doctor.langs || [];
  const tags = doctor.tags || doctor.focus_areas || [];
  const fullBio = doctor.one_sentence_bio || doctor.bio || '';
  const [expanded, setExpanded] = useState(false);
  const truncated = useMemo(()=> fullBio.length > 180 ? fullBio.slice(0, 180).trim() + '…' : fullBio, [fullBio]);
  const showToggle = fullBio.length > 180;

  return (
    <div className="card poster h-100" aria-labelledby={`doc-name-${doctor.id || 'current'}`}>      
      <div className="poster-header d-flex align-items-start">
        <div className="poster-avatar" aria-hidden>{specialtyIcon(doctor.specialty)}</div>
        <div className="poster-head-text flex-grow-1">
          <h3 id={`doc-name-${doctor.id || 'current'}`} className="poster-name mb-1">{doctor.name}</h3>
          <div className="poster-subline d-flex flex-wrap align-items-center gap-2">
            <span className="poster-specialty">{doctor.specialty}</span>
            <span className={`status-pill status-${status.variant}`}>{status.label}</span>
            {rating && (
              <span className="rating-pill" aria-label={`Rating ${rating} out of 5`}>
                <FaStar className="me-1 star" /> {rating.toFixed(1)}{reviews ? <span className="reviews-count"> ({reviews})</span> : ''}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="poster-body mt-3">
        {experienceYears && (
          <div className="chip-row mb-2">
            <span className="chip sm" aria-label={`${experienceYears} years experience`}>{experienceYears} yrs exp</span>
            {languages && languages.length > 0 && (
              <span className="chip sm" title={`Languages: ${languages.join(', ')}`}> <FaLanguage className="me-1" /> {languages.slice(0,2).join(', ')}{languages.length>2?'…':''}</span>
            )}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="tag-row d-flex flex-wrap gap-2 mb-2">
            {tags.slice(0,6).map((t, i)=>(<span key={i} className="tag-chip">{t}</span>))}
          </div>
        )}
        <div className="availability-line small"><strong>Availability:</strong> {doctor.availability || 'Not specified'}</div>
        <p className="bio mt-2" aria-expanded={expanded}>{expanded ? fullBio : truncated}</p>
        {showToggle && (
          <button type="button" className="btn-link-more" onClick={()=>setExpanded(e=>!e)} aria-label={expanded? 'Collapse bio' : 'Expand bio'}>{expanded? 'Show less' : 'Read more'}</button>
        )}
        {doctor.verified && (
          <div className="verified-line mt-2" aria-label="Verified professional"><FaCheckCircle className="me-1 text-success" /> Verified</div>
        )}
        <div className="mt-3 doctor-actions actions-flex">
          <a
            className="btn btn-call flex-fill"
            href={doctor.phone ? `tel:${doctor.phone}` : '#'}
            onClick={(e)=>!doctor.phone && e.preventDefault()}
          >
            <FaPhone /> <span>Call</span>
          </a>
          <button
            type="button"
            className="btn btn-appointment flex-fill"
            aria-label="Book appointment"
            onClick={()=>window.alert('Appointment booking coming soon')}
          >
            <FaCalendarCheck /> <span>Book</span>
          </button>
        </div>
      </div>
    </div>
  );
}
