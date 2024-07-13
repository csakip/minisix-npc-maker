import { Fragment } from "react";

function SeparatedList({ children, separator = ",\u00A0" }) {
  console.log("rendering SeparatedList", children.length);
  return children.map((child, i) => (
    <Fragment key={i}>
      {child}
      {i < children.length - 1 ? separator : ""}
    </Fragment>
  ));
}

export default SeparatedList;
