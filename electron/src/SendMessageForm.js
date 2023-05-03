import React from 'react';
import axios from 'axios';
import {IconButton, Tooltip} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const { ipcRenderer } = window.require('electron');

class SendMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {to: '', message: ''};

        this.handleToChange = this.handleToChange.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleToChange(event) {
        this.setState({to: event.target.value});
    }

    handleMessageChange(event) {
        this.setState({message: event.target.value});
    }

    async handleSubmit(event) {
        const encryptMessage = async () => {
            event.preventDefault();
            const retVal = await axios.get(
                "http://localhost:5000/getUser", {
                    params: {
                        name: this.state.to,
                    }
                });

            const encrypted = JSON.parse(ipcRenderer.sendSync('sendMessageReq', {remoteUser: JSON.stringify(retVal.data), localUser: this.props.name, message: this.state.message}));
            return encrypted;
        }
        const encrypted = await encryptMessage();
        const submitRequest = async () => {
            await axios.post("http://localhost:5000/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                to: this.state.to,
                from: this.props.name,
                message: encrypted,
            })
                .catch(error => {
                    window.alert(error);

                });
        }
        submitRequest();

        alert('A message was sent: ' + this.state.message + ' to: ' + this.state.to);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    To:
                    <input type="text" value={this.state.to} onChange={this.handleToChange} />
                </label>
                <label>
                    Message:
                    <input type="text" value={this.state.message} onChange={this.handleMessageChange} />
                </label>
                <input type="submit" value="Send" />
                <Tooltip title="When a message is sent it is encrypted using the user's keys and sent to the server">
                    <IconButton>
                        <InfoIcon></InfoIcon>
                    </IconButton>
                </Tooltip>
            </form>
        );
    }
}

export default SendMessageForm;