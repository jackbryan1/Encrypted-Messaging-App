import * as React from 'react';
import Messages from "./Messages";

export default function ControlledAccordions({ messages }) {
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div>
            {messages.map((message, i) => <Messages message={message} key={i}/>)}
        </div>
    );
}
