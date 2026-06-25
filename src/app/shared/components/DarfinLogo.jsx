export function DarfinLogo({ className, size = 24 }) {
  return <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
      {
    /* Target/Radar background */
  }
      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" strokeDasharray="4 4" />
      
      {
    /* Dolphin leap curve */
  }
      <path d="M2 18C5 12 9 10 13 11C16.5 11.8 19.5 9.5 21 6" strokeWidth="2" />
      
      {
    /* Dolphin dorsal fin */
  }
      <path d="M9 10.5C9 10.5 10 6 12 7C11 8.5 10 11 10 11" fill="currentColor" stroke="none" />
      
      {
    /* Dart hitting the mark */
  }
      <path d="M22 2L15 9" strokeWidth="2" />
      <polygon points="22,2 18.5,2.5 19.5,5.5" fill="currentColor" stroke="none" />
      
      {
    /* Target bullseye */
  }
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity="0.2" strokeOpacity="0.5" />
    </svg>;
}
