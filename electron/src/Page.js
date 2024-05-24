import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import RegistrationForm from "./RegistrationForm";
import SendMessageForm from "./SendMessageForm";
import ReceiveMessageForm from "./ReceiveMessageForm";

const drawerWidth = 800;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        flexGrow: 1,
        padding: theme.spacing(3),
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && {
            transition: theme.transitions.create('margin', {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
            }),
            marginRight: 0,
        }),
    }),
);

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
}));

export default function Page() {
    const theme = useTheme();
    const [open, setOpen] = React.useState(false);
    const [name, setName] = React.useState('');

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline/>
            <AppBar position="fixed" open={open}>
                <Toolbar>
                    <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} component="div">
                        Educational Encrypted Messaging Application
                    </Typography>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerOpen}
                        sx={{ ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Main open={open}>
                <DrawerHeader/>
                <RegistrationForm name={name} setName={setName}></RegistrationForm>
                <SendMessageForm name={name}></SendMessageForm>
                <ReceiveMessageForm name={name}></ReceiveMessageForm>
            </Main>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                    },
                }}
                anchor="right"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Typography variant="h4" gutterBottom align={"left"} sx={{ 'padding-left': 30 }}>
                    Extended Triple Diffie-Hellman Protocol (X3DH)
                </Typography>
                <Typography align={"left"} sx={{ 'padding-left': 30 }}>
                    The Extended Triple Diffie-Hellman Protocol is a key agreement protocol that mutually authenticates
                    two users based on public keys and establishes a shared secret key.
                    <br/><br/>
                    X3DH has 3 parties:
                    <List
                        sx = {{
                            listStyleType: 'disc',
                            pl: 2,
                            '& .MuiListItem-root': {
                                display: 'list-item',
                            },
                        }}>
                        <ListItem>
                            Alice (who is sending a message)
                        </ListItem>
                        <ListItem>
                            Bob (who is receiving that message)
                        </ListItem>
                        <ListItem>
                            A Server (which stores keys and messages)
                        </ListItem>
                    </List>
                    The first step in the process is for both Alice and Bob to register and generate their keys. Alice
                    will need an identity key and ephemeral key, whilst Bob will need an identity key, a signed prekey
                    and a set of one time prekeys.
                    <br/><br/>
                    Explanation of different keys:
                    <List
                        sx = {{
                            listStyleType: 'disc',
                            pl: 2,
                            '& .MuiListItem-root': {
                                display: 'list-item',
                            },
                        }}>
                        <ListItem>
                            Identity Key: A key used to identify a user
                        </ListItem>
                        <ListItem>
                            Signed Prekey: A prekey that is signed by the identity key's private key
                        </ListItem>
                        <ListItem>
                            One Time Prekey: A key used only once and then deleted.
                        </ListItem>
                        <ListItem>
                            Ephemeral key: A one time key generated once per run based off of a public key
                        </ListItem>
                    </List>
                    In X3DH all keys are generated using one of two functions: Curve25519 or Curve448. These are both
                    functions that produce elliptic curve keys. Elliptic curve keys are generated based on mathematical
                    equations that produce a curve which messages can be represeted on. These are secure because solving
                    the problems generated by these curves takes an extremely long time and a lot of computational
                    power. These keys are key pairs with a public key and a private key.
                    <br/><br/>
                    Bob's keys will be published to the Server. His identity key only needs to be published once, but
                    his signed prekey will need to be updated after a some period of time (e.g. once a month).
                    Additionally, Bob will need to upload new prekeys at regular intervals as the existing prekeys
                    stored in the database deplete.
                    <br/><br/>
                    In order to start X3DH, Alice will request a 'prekey bundle' from the server that contains Bob's
                    identity key, signed prekey, and a one time prekey. Alice will verify the signed prekey and generate
                    her ephemeral key. Then Alice will perform 4 Diffie-Hellman functions and concatenate the results
                    and pass them into a Key Derivation Function to get the shared secret that will be used for the
                    session. The first two function provide mutual authentication whilst the last two provide forward
                    secrecy.
                    <br/><br/>
                    The functions are as follows:
                    <List
                        sx = {{
                            listStyleType: 'disc',
                            pl: 2,
                            '& .MuiListItem-root': {
                                display: 'list-item',
                            },
                        }}>
                        <ListItem>
                            Alice's identity key and Bob's signed prekey
                        </ListItem>
                        <ListItem>
                            Alice's ephemeral key and Bob's identity key
                        </ListItem>
                        <ListItem>
                            Alice's ephemeral key and Bob's signed prekey
                        </ListItem>
                        <ListItem>
                            Alice's ephemeral key and Bob's one time prekey
                        </ListItem>
                    </List>
                    Once the shared secret has been calculated, Alice must delete her ephemeral private key and the
                    outputs of the Diffie-Hellman functions. Alice then calculates 'associated data' by encoding both
                    her identity key and Bob's identity key and concatenating the output. Alice can then send Bob an
                    initial message which contains
                    her identity key, ephemeral key, an identifier stating which of prekey was used and initial
                    ciphertext using the associated data and the secret key. This initial ciphertext will also serve as
                    the first message in the Double Ratchet
                    algorithm.
                    <br/><br/>
                    When Bob receives Alice's initial message then he retrieve Alice's identity key and ephemeral key
                    from the message. Bob will also retrieve his identity private key and the private key corresponding
                    to the signed prekey and one time prekey that Alice used. He will then repeat the Diffie-Hellman
                    functions and Key Derivation Function performed by Alice so that he can also calculate the secret
                    key. Bob can also reconstruct the associated data byte sequence the same way that Alice calculated
                    it. Bob will then be able to attempt to decrypt the ciphertext using the secret key and associated
                    data. If the decrypt fails then Bob will abort X3DH. if it is successful then Bob can delete the one
                    time prekey private key for forward secrecy, and any further messages will use a key derived from
                    the secret key using the Double Ratchet Algorithm.
                </Typography>
                <br/>
                <Divider/>
                <br/>
                <Typography variant="h4" gutterBottom align={"left"} sx={{ 'padding-left': 30 }}>
                    Double Ratchet Algorithm
                </Typography>
                <Typography align={"left"} sx={{ 'padding-left': 30 }}>
                    The Double Ratchet Algorithm is used to exchange encrypted messages based on a shared secret key.
                    <br/><br/>
                    The Double Ratchet algorithm follows on from X3DH. It contains only two parties: Alice and Bob.
                    These two parties use the secret key agreed in X3DH as their initial key and then derive a new key
                    every message, using some Diffie-Hellman values that are attached to each message and then the
                    results of Diffie-Hellman calculations are used to calculate the new key. This prevents earlier and
                    later messages being decrypted in case the keys used for one message are compromised.
                    <br/><br/>
                    A Key Derivation Function chain (KDF chain) is how the new key is calculated every time. A KDF is a
                    function that takes a secret KDF key and some input data and then returns output data. The output
                    cannot be differentiated from random, as long as the key is kept secret. A KDF chain is when some of
                    the output of a KDF is used as an output key and some is used to replace the KDF key, and then
                    another input can be used to repeat the process. A KDF chain is resilient as the output keys appear
                    random to an attacker who has no knowledge of the KDF key. It also provides both forward security
                    and break-in recovery as both the past and future keys will appear random to an attacker who gains
                    knowledge of the KDF key.
                    <br/><br/>
                    In the Double Ratchet session between Alice and Bob, they will each store a KDF key for 3 chains:
                    <List
                        sx = {{
                            listStyleType: 'disc',
                            pl: 2,
                            '& .MuiListItem-root': {
                                display: 'list-item',
                            },
                        }}>
                        <ListItem>
                            Root chain: Chain for calculating new KDF keys.
                        </ListItem>
                        <ListItem>
                            Sending chain: Chain for sending messages. Alice's sending chain is the same as Bob's
                            receiving chain and vice versa.
                        </ListItem>
                        <ListItem>
                            Receiving chain: Chain for receiving messages. Alice's receivig chain is the same as Bob's
                            sending chain and vice versa.
                        </ListItem>
                    </List>
                    When the root chain is advanced this is called the Diffie-Hellman ratchet and when the sending and
                    receiving chains advance this is called the symmetric-key ratchet. Together these make up the Double
                    Ratchet.
                    <br/><br/>
                    The symmetric-key ratchet works by encrypting every message sent and received with a unique message
                    key. These keys are generated from the output keys of the sending and receiving chains. The KDF key
                    for these chains are called chain keys. Calculating the next chain key and message key is a single
                    ratchet step. Additionally, these keys are not use to calculate any other keys, so they can be
                    stored without affecting security, and this enables handling out of order messages.
                    <br/><br/>
                    The Diffie-Hellman ratchet works by creating a key pair (similar to the keys generated for each
                    user) which becomes the current ratchet key pair. This becomes the current ratchet key pair which is
                    sent with the current message. When a new key is received from the other party then the ratchet step
                    is performed to generate a new key pair. This means that both parties take turns replacing the
                    ratchet key pair, and if an attacker compromises a private key it will soon be replaced by a new
                    one. A full ratchet step consists of updating the root chain twice and using the output kes as new
                    receiving and sending chain keys.
                    <br/><br/>
                    When combined these two ratchet steps form the Double Ratchet where for each message sent a
                    symmetric-key ratchet is applied to the sending or receiving chain to derive the message key, and
                    when a new ratchet public key is received the Diffie-Hellman ratchet is performed before the
                    symmetric-key ratchet to replace the chain key.
                    <br/><br/>
                    One final feature of the Double Ratchet algorithm is the ability to handle out of order messages. It
                    stores the message number in the sending chain as part of the message. This enables the recipient to
                    advance to the current message key and store any skipped keys in case the skipped messages arrive
                    later.
                </Typography>
            </Drawer>
        </Box>
    );
}