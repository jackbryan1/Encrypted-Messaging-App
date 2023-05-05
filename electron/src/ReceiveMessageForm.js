import React from 'react';
import axios from 'axios';
import {IconButton, Tooltip} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import Messages from "./Messages";

const { ipcRenderer } = window.require('electron');

class ReceiveMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: new Map()};

        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async handleSubmit(event) {
        const decryptMessages = async () => {
            event.preventDefault();
            this.state.message.clear();
            const messages = ipcRenderer.sendSync('readMessagesReq', {name: this.props.name});

            const newMessages = await axios.get(
                "http://localhost:5000/getMessage", {
                    params: {
                        name: this.props.name,
                    }
                });
            for (const item of newMessages.data) {
                const remoteUser = await axios.get(
                    "http://localhost:5000/getUser", {
                        params: {
                            name: item.from,
                        }
                    });

                const decrypted = JSON.parse(ipcRenderer.sendSync('receiveMessageReq', {remoteUser: JSON.stringify(remoteUser.data), localUser: item.to, message: item.message}));
                const displayMessage = "[" + item.date + "]" + item.from + ": " + decrypted;

                console.log(messages);
                console.log(newMessages);
                if (!messages.has(item.from)) {
                    messages.set(item.from, []);
                }
                const msgs = messages.get(item.from);
                msgs.push({date: item.date, other: item.from, message: displayMessage});
                messages.set(item.from, msgs);
                console.log(messages);
            }
            ipcRenderer.sendSync('writeMessagesReq', {name: this.props.name, messages: messages});

            this.setState({message: messages})
        }
        await decryptMessages();

        //alert('A message was received: ' + message + ' from: ');
        event.preventDefault(this.props.name, this.state.message);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input type="submit" value="Receive" />
                <Tooltip title="When a message is received it is decrypted using the private key of the recipient">
                    <IconButton>
                        <InfoIcon></InfoIcon>
                    </IconButton>
                </Tooltip>
                <div>
                    {Array.from(this.state.message.entries()).map((message) => <Messages message={message}/>)}
                </div>
            </form>
        );
    }
}

export default ReceiveMessageForm;