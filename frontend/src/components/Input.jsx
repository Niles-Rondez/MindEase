function Input({hint}){
    return(
        <input 
            type="text" 
            className="text-lg border border-gray-300 rounded-lg px-4 py-3 w-full mb-4 focus:outline-none focus:border-lilac focus:ring-1 focus:ring-lilac" 
            placeholder={hint}
        />
    );
}

export default Input;