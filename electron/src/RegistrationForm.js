import React from 'react';
import axios from 'axios';
import {IconButton, Tooltip} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
const { ipcRenderer } = window.require('electron');

class RegistrationForm extends React.Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.props.setName(event.target.value);
    }

    async handleSubmit(event) {
        event.preventDefault();
        const checkExisting = async () => {
            const userData = await axios.get(
                "http://localhost:5000/getUser", {
                    params: {
                        name: this.props.name,
                    }
                });
            return !userData.data;
        }

        const userExists = await checkExisting();
        if (userExists) {
            let userDetails = JSON.parse(ipcRenderer.sendSync('generateKeysReq', this.props.name))

            const submitRequest = async () => {
                await axios.post("http://localhost:5000/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    name: this.props.name,
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
        }

        alert('A name was submitted: ' + this.props.name);
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={this.props.name} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Set" />
                <Tooltip title="At registration your public and private keys will be generated along with your prekeys">
                    <IconButton>
                        <InfoIcon></InfoIcon>
                    </IconButton>
                </Tooltip>
            </form>
        );
    }
}

export default RegistrationForm;