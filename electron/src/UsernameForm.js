import React from 'react';
import axios from 'axios';
//import generateKeys from '../public/GenerateKeys';
const { ipcRenderer } = window.require('electron');

class UsernameForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        //const userDetails = generateKeys();
        let userDetails = JSON.parse(ipcRenderer.sendSync('generateKeysReq', null));

        console.log(userDetails);

        const submitRequest = async () => {
            await axios.post("http://localhost:5000/username", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                name: JSON.stringify(this.state.value),
                registrationId: JSON.stringify(userDetails.registrationId),
                publicIdentityKey: JSON.stringify(userDetails.identityKeyPair.publicKey),
                signedPreKeyId: JSON.stringify(userDetails.signedPreKey.id()),
                signedPreKeyPublicKey: JSON.stringify(userDetails.signedPreKey.publicKey()),
                signedPreKeyRecordSignature: JSON.stringify(userDetails.signedPreKey.signature()),
                preKeys: JSON.stringify(userDetails.preKeys),
            })
                .catch(error => {
                    window.alert(error);

                });
        }

        submitRequest();

        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={this.state.value} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Set" />
            </form>
        );
    }
}

export default UsernameForm;