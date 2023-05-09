import React from 'react';
import axios from 'axios';
import {Alert, Button, Collapse, IconButton, TextField, Tooltip} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";

const { ipcRenderer } = window.require('electron');

class SendMessageForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {to: '', message: '', error: false, success: false};

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
        event.preventDefault();
        const getUser = async () => {
            const retVal = await axios.get(
                "http://localhost:5000/getUser", {
                    params: {
                        name: this.state.to,
                    }
                });
            return retVal.data;
        }
        const encryptMessage = async (user) => {
            return JSON.parse(ipcRenderer.sendSync('sendMessageReq', {
                remoteUser: JSON.stringify(user),
                localUser: this.props.name,
                message: this.state.message
            }));
        }

        const user = await getUser();
        if (this.state.to !== "" && this.state.to !== this.props.name && user !== null) {
            const encrypted = await encryptMessage(user);
            const date = this.getDate();
            const submitRequest = async () => {
                await axios.post("http://localhost:5000/sendMessage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    to: this.state.to,
                    from: this.props.name,
                    date: date.toString(),
                    type: encrypted.type,
                    message: encrypted.message,
                })
                    .catch(error => {
                        window.alert(error);
                    });
            }

            const removePreKey = async () => {

                const removedUser = JSON.parse(ipcRenderer.sendSync('removePreKeyReq', {remoteUser: JSON.stringify(user)}));

                await axios.post("http://localhost:5000/replacePreKey", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    name: removedUser.name,
                    preKeys: removedUser.preKeys,
                })
                    .catch(error => {
                        window.alert(error);
                    });
            }

            submitRequest();

            removePreKey();

            const displayMessage = "[" + date + "]" + this.props.name + ": " + this.state.message;

            const messages = new Map();
            messages.set(this.state.to, [{date: date, other: this.state.to, message: displayMessage}]);
            ipcRenderer.sendSync('writeMessagesReq', {name: this.props.name, messages: messages});
            this.setState({to: "", message: "", error: false, success: true});
        } else {
            this.setState({error: true, success: false});
        }
    }

    getDate() {
        const date = new Date();
        return date.getDate() + "/"
            + (date.getMonth()+1)  + "/"
            + date.getFullYear() + " @ "
            + date.getHours() + ":"
            + date.getMinutes() + ":"
            + date.getSeconds();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <TextField label="To" size="small" variant="outlined" value={this.state.to} onChange={this.handleToChange} />
                <TextField label="Message" size="small" variant="outlined" value={this.state.message} onChange={this.handleMessageChange} />
                <Button variant="contained" type="submit">Send</Button>
                <Tooltip title="When a message is sent it is encrypted using the user's keys and sent to the server">
                    <IconButton>
                        <InfoIcon></InfoIcon>
                    </IconButton>
                </Tooltip>
                <Collapse in={this.state.error}>
                    <Alert
                        severity="error"
                        onClose={() => {this.setState({error: false});}}
                        sx={{ mb: 2 }}
                    >
                        Invalid Username
                    </Alert>
                </Collapse>
                <Collapse in={this.state.success}>
                    <br></br>
                    <Alert
                        severity="success"
                        onClose={() => {this.setState({success: false});}}
                        sx={{ mb: 2 }}
                    >
                        Message Sent!
                    </Alert>
                </Collapse>
                <br></br>
            </form>
        );
    }
}

export default SendMessageForm;