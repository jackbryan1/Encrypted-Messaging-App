import * as React from 'react';
import Messages from "./Messages";

export default function ControlledAccordions({ messages }) {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div>
            {messages.map((object, i) => <Messages obj={object} key={i}/>)}
        </div>
    );
}
