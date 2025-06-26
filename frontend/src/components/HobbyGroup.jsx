import Hobby from "./Hobby";

function HobbyGroup({ title, hobbies, selectedHobbies, onHobbyToggle }) {
    return (
        <div className="mb-6">
            <h3 className="mb-3 text-lg font-semibold text-gray-800">{title}</h3>
            <div className="flex flex-wrap gap-2">
                {hobbies.map((hobby) => (
                    <Hobby
                        key={hobby.id}
                        hobby={hobby}
                        isSelected={selectedHobbies.includes(hobby.id)}
                        onToggle={onHobbyToggle}
                    />
                ))}
            </div>
        </div>
    );
}

export default HobbyGroup;