import React from 'react';
import axios from 'axios';
import Session from './Session';

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
        const getRecipient = async () => {
            return await axios.get(
                "http://localhost:5000/getUser", {
                    method: "GET",
                    params: {
                        name: this.state.to,
                    }
                });
        }
        const remoteUser = JSON.parse(ipcRenderer.sendSync('deserialiseRemoteReq', (await getRecipient()).data));
        const localUser = JSON.parse(ipcRenderer.sendSync('deserialiseLocalReq', this.state.to));
        new Session(remoteUser, localUser);
        /*        let message = JSON.parse(ipcRenderer.sendSync('sendMessageReq', null));
                const submitRequest = async () => {
                    await axios.post("http://localhost:5000/message", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        name: JSON.stringify(this.state.value),
                    })
                        .catch(error => {
                            window.alert(error);

                        });
                }

                submitRequest();*/

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
            </form>
        );
    }
}

export default SendMessageForm;