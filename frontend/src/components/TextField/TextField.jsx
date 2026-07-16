import './TextField.css'

export default function TextField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightSlot,
  error,
  ...rest
}) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      <div className={`field-control ${error ? 'field-control-error' : ''}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...rest}
        />
        {rightSlot && <span className="field-right">{rightSlot}</span>}
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}
