import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

//const electron = window.require('electron');

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');

client.login(auth.token);


var globalPage;
client.on('ready', () => {
    console.log(`\n\n\nLogged in as ${client.user.tag}!`);


    let textChannels=[];
    client.channels.array().map(x=>{
		if (x.type==='text'){
   			textChannels.push(<div onClick={()=>clickChannel(x.id)}  className="channel" key={x.id}>{x.name}</div>);
   		}
   		return 0;
	});
   	globalPage.setState({
   		guilds:client.guilds.array().map(x=>{
   			return <img onClick={()=>clickGuild(x)} className="guildIcon" src={x.iconURL} alt={x.name} key={x.id}/>
   		}),
   		channels:textChannels,
   	});
});

client.on('message', msg => {
	globalPage.setState({
		messages:globalPage.state.messages.concat(createMessage(msg)),
	});
});
client.on('channelCreate',channel=>{
	globalPage.setState({
		channels:globalPage.state.channels.concat(<div onClick={()=>clickChannel(channel.id)}  className="channel" key={channel.id} name={channel.name}>{channel.name}</div>),
	})
})

function clickChannel(channelId){
	var channelDivs=[];
	client.channels.get(channelId).guild.channels.forEach((val, key)=>{
		if (val.type!=='text'){

		}else if (key==channelId){
			console.log(key);
			channelDivs.push(<div onClick={()=>clickChannel(key)} className="selectedChannel" key={key}>{val.name}</div>);
		}else{
			channelDivs.push(<div onClick={()=>clickChannel(key)} className="channel" key={key}>{val.name}</div>);
		}
	})

	//channelDivs=["hey"];
	client.channels.get(channelId).fetchMessages().then(msgs=>{
		globalPage.setState({
			messages:msgs.map(x=>{return createMessage(x)}).reverse(),
			channels:channelDivs
		})
	});

}
function clickGuild(guild){
	globalPage.setState({
		channels:guild.channels.map(x=>{
			if (x.type==='text'){
	   			return <div onClick={()=>clickChannel(x.id)} className="channel" id="x.id">{x.name}</div>
	   		}
		})
	});
}
function createMessage(msg){
	var nameColor={
		color:'white',
		color:msg.member.displayHexColor,
	}
	
	var messageText=msg.cleanContent;
	let match=messageText.match(/\*{2}[^\*]+\*{2}/);
	var newMessageText;
	while(match!=null){
		newMessageText=<span>{newMessageText}{messageText.slice(0,match.index)}<b>{match[0].slice(2,-2)}</b></span>;
		messageText=messageText.slice(match.index+match[0].length);
		match=messageText.match(/\*{2}[^\*]+\*{2}/);
	}
	newMessageText=<span>{newMessageText}{messageText}</span>;
	msg.attachments.forEach((val)=>{
		newMessageText=<span><img src={val.url} alt="" className="embededImage"/>{newMessageText}</span>;
	})

	return (<div className = "message" key={msg.id}>
				<img src={msg.author.avatarURL} alt="" className="avatar"/>
				<div>
					<div className="messageAuthor">
						<input style={{float:'right'}}type="checkbox" onClick={()=>{selectMessage(msg)}}></input>
						<span style={{float:'right'}} onClick={()=>{printMsg(msg)}}>{msg.author.tag}</span>
						<span style={nameColor}>{msg.member.displayName}</span>
						<span className="dateTime"> {msg.createdAt.toLocaleString()}</span> 
					</div>
					<div className="messageText">{newMessageText}</div>
				</div>
			</div>)
}
let selectedMessages= new Map();
function selectMessage(msg){
	selectedMessages.set(msg.id,msg);
}
function clearMessages(){
	selectedMessages= new Map();
}
function printMessages(){
	selectedMessages.forEach(printMsg);
}
function printMsg(val){
	console.log(val);
}
function deleteMessages(){
	selectedMessages.forEach(deleteMsg);
	function deleteMsg(val, key){
		val.delete(); 
	}
	clearMessages();
}
class Page extends React.Component{
	constructor(props){
		super(props);
		this.state={
			guilds:"guilds",
			channels:'channels',
			messages:'messages',
			members:'members'
		}
		globalPage=this;
	}

	render(){
		return (
			<div>
				<Guilds guilds={this.state.guilds}/>
				<Channels channels={this.state.channels}/>
				<Messages messages={this.state.messages}/>
				<Members members={this.state.members}/>
			</div>
		)
	}
	showMessages(){
		console.log(this.state.messages);
	}
}

class Guilds extends React.Component{
	constructor(props){
		super(props);
		this.state={
			guilds:this.props.guilds,
		}
	}
	componentWillReceiveProps(props){
		this.setState({
			guilds:props.guilds,
		})
	}
	render(){
		return (
			<div id="guilds">
				{this.state.guilds}
			</div>
		)
	}
}

class Channels extends React.Component{
	constructor(props){
		super(props);
		this.state={
			channels:this.props.channels,
		}
	}
	componentWillReceiveProps(props){
		this.setState({
			channels:props.channels,
		})
	}
	render(){
		return (
			<div id="channels">
				{this.state.channels}
			</div>
		)
	}
}

class Messages extends React.Component{
	
	constructor(props){
		super(props);
		this.state={
			messages:this.props.messages,
		}
	}
	componentWillReceiveProps(props){
		this.setState({
			messages:props.messages
		})
	}
	render(){
		return (
			<div id="messages">
				<div id="messageButtons">
					<button type="button" className="button" onClick={()=>deleteMessages()}>Delete</button><button type="button" className="button" onClick={()=>clearMessages()}>Clear Selection</button>
				</div>
				{this.state.messages}
			</div>
		)
	}
	showMessages(){
		console.log(this.state.messages);
	}
}

class Members extends React.Component{
	constructor(props){
		super(props);
		this.state={
			members:this.props.members,
		}
	}
	componentWillReceiveProps(props){
		this.setState({
			members:props.members
		})
	}
	render(){
		return (
			<div id="members">
				{this.state.members}
			</div>
		)
	}

}

ReactDOM.render(
	<Page />,
	document.getElementById('root')
);
