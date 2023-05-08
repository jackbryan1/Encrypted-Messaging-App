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

        const replacePreKey = async (preKeys) => {
            console.log(preKeys.length);
            await axios.post(
                "http://localhost:5000/replacePreKey", {
                    params: {
                        name: this.props.name,
                        preKeys: preKeys,
                    }
                });
        }

        const decryptMessages = async () => {
            event.preventDefault();
            this.state.message.clear();

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

                const decrypted = JSON.parse(ipcRenderer.sendSync('receiveMessageReq', {remoteUser: JSON.stringify(remoteUser.data), localUser: item.to, message: item.message, type: item.type}));

                const newPreKeys = JSON.parse(ipcRenderer.sendSync('getPreKeyReq', item.to));
                replacePreKey(newPreKeys);

                const displayMessage = "[" + item.date + "]" + item.from + ": " + decrypted;

                const newMessages = new Map();
                newMessages.set(item.from, [{date: item.date, other: item.from, message: displayMessage}]);

                ipcRenderer.sendSync('writeMessagesReq', {name: this.props.name, messages: newMessages});
            }

            const messages = ipcRenderer.sendSync('readMessagesReq', {name: this.props.name});

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