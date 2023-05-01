import React from 'react';
import axios from 'axios';
import {IconButton, TextField, Tooltip} from "@mui/material";
import InfoIcon from '@mui/icons-material/Info';
import ControlledAccordions from "./temp";
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
            this.state.message.clear();
            event.preventDefault();
            const messages = await axios.get(
                "http://localhost:5000/getMessage", {
                    params: {
                        name: this.props.name,
                    }
                });
            for (const item of messages.data) {
                const remoteUser = await axios.get(
                    "http://localhost:5000/getUser", {
                        params: {
                            name: item.from,
                        }
                    });

                const decrypted = JSON.parse(ipcRenderer.sendSync('receiveMessageReq', {remoteUser: JSON.stringify(remoteUser.data), localUser: item.to, message: item.message}));
                console.log(this.state.message.has(item.from));
                if (this.state.message.has(item.from)) {
                    const msgs = this.state.message.get(item.from);
                    msgs.push(decrypted);
                    console.log(msgs);
                    this.state.message.set(item.from, msgs);
                } else {
                    const msgs = [decrypted];
                    console.log(msgs);
                    this.state.message.set(item.from, msgs);
                }
            }
        }
        await decryptMessages();
        this.setState({message: this.state.message})
        console.log(this.state.message);

        //alert('A message was received: ' + message + ' from: ');
        event.preventDefault();
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