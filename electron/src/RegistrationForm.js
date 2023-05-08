import React from 'react';
import axios from 'axios';
import {Alert, Collapse, IconButton, Tooltip} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
const { ipcRenderer } = window.require('electron');

class RegistrationForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name: "", error: false};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({name: event.target.value})
    }

    async handleSubmit(event) {
        event.preventDefault();
        const existsLocally = async () => {
            const fileExists = JSON.parse(ipcRenderer.sendSync('checkUserReq', this.state.name));
            return this.state.name !== "" && fileExists;
        }

        const existsRemotely = async () => {
            const userData = await axios.get(
                "http://localhost:5000/getUser", {
                    params: {
                        name: this.state.name,
                    }
                });
            return this.state.name !== "" && userData.data !== null;
        }

        const submitRequest = async () => {
            let userDetails = JSON.parse(ipcRenderer.sendSync('generateKeysReq', this.state.name));
            await axios.post("http://localhost:5000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                name: this.state.name,
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

        const existsRemote = await existsRemotely();
        const existsLocal = await existsLocally();
        if (this.state.name === "") {
            this.setState({error: true});
        } else if (!existsRemote) {
            submitRequest();
            this.props.setName(this.state.name);
            this.setState({error: false});
        } else if (!existsLocal) {
            this.setState({error: true});
        } else {
            this.props.setName(this.state.name);
            this.setState({error: false});
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={this.state.name} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Set" />
                <Tooltip title="At registration your public and private keys will be generated along with your prekeys">
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
            </form>
        );
    }
}

export default RegistrationForm;