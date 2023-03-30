import React from 'react';
import axios from 'axios';
const { ipcRenderer } = window.require('electron');

class RegistrationForm extends React.Component {
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
        let userDetails = JSON.parse(ipcRenderer.sendSync('generateKeysReq', this.state.value));

        const submitRequest = async () => {
            await axios.post("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                name: this.state.value,
                registrationId: userDetails.registrationId,
                publicIdentityKey: userDetails.publicIdentityKey,
                signedPreKeyId: userDetails.signedPreKeyId,
                signedPreKeyPublicKey: userDetails.signedPreKeyPublicKey,
                signedPreKeyRecordSignature: userDetails.signedPreKeyRecordSignature,
                preKeys: userDetails.preKeys,
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

export default RegistrationForm;