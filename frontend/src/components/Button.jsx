function Button({ text, type = "button", disabled = false, onClick }){
    return(
        <button 
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`font-inter font-bold text-xl py-3 px-10 rounded-xl cursor-pointer w-full transition-colors ${
                disabled 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-lilac text-white hover:bg-plum'
            }`}
        >
            {text}
        </button>
    );
}

export default Button;