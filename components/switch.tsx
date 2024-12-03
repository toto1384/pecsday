export const Switch = ({ isOn, name, setIsOn }: { isOn: boolean, setIsOn: (b: boolean) => void, name: string }) => {
    const toggleSwitch = () => setIsOn(!isOn);

    return (
        <div onClick={toggleSwitch} className="flex flex-row items-center space-x-2">
            <div
                onClick={toggleSwitch}
                style={{
                    width: "60px",
                    height: "30px",
                    borderRadius: "15px",
                    backgroundColor: isOn ? "#2563eb" : "#ccc",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                }}
            >
                <div
                    style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                        transform: `translateX(${isOn ? "30px" : "0px"})`,
                        transition: "transform 0.3s ease",
                    }}
                />
            </div>
            <p>{name}</p>
        </div>
    );
};