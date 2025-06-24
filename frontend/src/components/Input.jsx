function Input({ hint, type = "text", value, onChange, required = false }){
    return(
        <input 
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-3 mb-4 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac" 
            placeholder={hint}
        />
    );
}

export default Input;