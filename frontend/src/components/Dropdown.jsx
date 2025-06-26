function Dropdown({ hint, options, value, onChange }) {
    return (
        <div className="mb-4">
            <label className="block px-2 mb-2 text-xl text-black/50 font-inter">Gender Identity</label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-4 py-3 text-lg bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac"
            >
                <option value="">{hint}</option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Dropdown;