import { createContext } from "react";
import React from "react";

export const TeamContext = createContext();

export const TeamProvider = ({children}) => {
    const [teams, setTeams] = React.useState([]);

    const addTeam = (newTeam) => {
        setTeams((prev) => [...prev, newTeam]);
    };

    return(
        <TeamContext.Provider value={{ teams, addTeam}}>
            {children}
        </TeamContext.Provider>
    );
};