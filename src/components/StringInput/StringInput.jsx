import PropTypes from "prop-types";
import "./StringInput.css";

export const StringInput = (props) => {
  const { data, legend, onChange } = props;

  const textArea = (
    <textarea
      type="text"
      value={data}
      className="data-display"
      rows={2}
      onChange={(e) => onChange(e.target.value)}
    />
  );

  if (legend) {
    return (
      <fieldset className="data-fieldset">
        <legend>{legend}</legend>
        {textArea}
      </fieldset>
    );
  }
  return textArea;
};

StringInput.propTypes = {
  data: PropTypes.string,
  onChange: PropTypes.func,
  legend: PropTypes.string.isRequired,
};
