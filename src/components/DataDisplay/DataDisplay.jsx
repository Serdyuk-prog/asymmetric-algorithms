import PropTypes from "prop-types";
import "./DataDisplay.css";

export const DataDisplay = (props) => {
  const { data="", legend, isHex } = props;

  const textArea = (
    <textarea
      type="text"
      value={isHex && data ? data.match(/.{2}/g).join(" ") : data}
      readOnly
      className="data-display"
      rows={2}
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

DataDisplay.propTypes = {
  data: PropTypes.string.isRequired,
  legend: PropTypes.string,
  isHex: PropTypes.bool,
};
