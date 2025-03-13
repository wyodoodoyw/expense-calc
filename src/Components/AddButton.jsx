function AddButton() {
  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        +
      </button>
      <ul className="dropdown-menu">
        <li>
          <a className="dropdown-item" href="#">
            Add Flight
          </a>
        </li>
        <li>
          <a className="dropdown-item" href="#">
            Add Layover
          </a>
        </li>
      </ul>
    </div>
  );
}

export default AddButton;
