function Button({text}){
    return(
        <button className="font-inter font-bold text-xl bg-lilac text-white py-3 px-10 rounded-xl hover:bg-plum cursor-pointer w-full transition-colors">{text}</button>
    );
}

export default Button;