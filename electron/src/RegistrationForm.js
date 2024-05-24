import React from 'react';
import axios from 'axios';
import {Alert, Button, Collapse, IconButton, TextField, Tooltip} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
const { ipcRenderer } = window.require('electron');

class RegistrationForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {name: "", error: false, success: false, errorMessage: ""};
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({name: event.target.value})
    }

    async handleSubmit(event) {
        console.log("submit registration");
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
            this.setState({error: true, success: false});
        } else if (!existsRemote) {
            submitRequest();
            this.props.setName(this.state.name);
            this.setState({name: "", error: false, success: true});
        } else if (!existsLocal) {
            this.setState({error: true, success: false});
        } else {
            this.props.setName(this.state.name);
            this.setState({name: "", error: false, success: true});
        }
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>

                <TextField variant="standard" InputProps={{readOnly: true,}} value={"Current Username: " + this.props.name} />
                <br></br><br></br>
                <TextField label="Username" size="small" variant="outlined" value={this.state.name} onChange={this.handleChange} />
                <Button variant="contained" type="submit">Set</Button>
                <Tooltip title="At registration your public and private keys will be generated along with your prekeys">
                    <IconButton>
                        <InfoIcon></InfoIcon>
                    </IconButton>
                </Tooltip>
                <Collapse in={this.state.error}>
                    <br></br>
                    <Alert
                        severity="error"
                        onClose={() => {this.setState({error: false});}}
                        sx={{ mb: 2 }}
                    >
                        Invalid Username!
                    </Alert>
                </Collapse>
                <Collapse in={this.state.success}>
                    <br></br>
                    <Alert
                        severity="success"
                        onClose={() => {this.setState({success: false});}}
                        sx={{ mb: 2 }}
                    >
                        Username Set!
                    </Alert>
                </Collapse>
                <br></br>
            </form>
        );
    }
}

export default RegistrationForm;