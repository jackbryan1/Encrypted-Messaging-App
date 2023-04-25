import React from 'react';
import axios from 'axios';

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
        const decryptMessages = async () => {
            event.preventDefault();
            const messages = await axios.get(
                "http://localhost:5000/getMessage", {
                    params: {
                        //name: this.state.to,
                        name: "test21",
                    }
                });
            console.log(messages.data[0]);
            const remoteUser = await axios.get(
                "http://localhost:5000/getUser", {
                    params: {
                        name: messages.data[0].from,
                    }
                });

            console.log(remoteUser);
            const decrypted = JSON.parse(ipcRenderer.sendSync('receiveMessageReq', {remoteUser: JSON.stringify(remoteUser.data), localUser: messages.data[0].to, message: messages.data[0].message}));
            return decrypted;
        }
        const message = await decryptMessages();
        this.state.message = message;
        //const remoteUser = JSON.parse(ipcRenderer.sendSync('deserialiseRemoteReq', (await getRecipient()).data));
        //const localUser = JSON.parse(ipcRenderer.sendSync('deserialiseLocalReq', this.state.to));
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

        alert('A message was received: ' + this.state.message + ' from: ' + this.state.to);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Messages:
                    <input type="textarea" value={this.state.message} onChange={this.handleMessageChange} />
                </label>
                <input type="submit" value="Receive" />
            </form>
        );
    }
}

export default SendMessageForm;