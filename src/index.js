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
	});
    let dmGuild = <div onClick={()=>openDMs()} key={0}>DMs</div>
   	globalPage.setState({
   		guilds:client.guilds.array().map(x=>{
   			return <img onClick={()=>clickGuild(x)} className="guildIcon" src={x.iconURL} alt={x.name} key={x.id}/>
   		}).concat(dmGuild),
   		channels:textChannels,
   	});

	client.users.forEach((val,key)=>{
		if (val.dmChannel==null){
			val.createDM();
		}
	})


});

client.on('message', msg => {
	globalPage.setState({
		messages:globalPage.state.messages.concat(createMessage(msg)),
	});
});
client.on('channelCreate',channel=>{
	if (channel.type==="dm"){
		addChannel(channel,channel.recipient.tag);
	}else{
		addChannel(channel,channel.name);
	}
})

function addChannel(channel,name){
	if (globalPage.state.channels==null){
		return;
	}
	globalPage.setState({
		channels:globalPage.state.channels.concat(<div onClick={()=>clickChannel(channel.id)}  className="channel" key={channel.id}>{name}</div>),
	})
}

function clickChannel(channelId){
	var channelDivs=[];
	if (client.channels.get(channelId).type==='dm'){
		client.channels.forEach((channel,key)=>{
			if (channel.type==='dm'){
				if (key===channelId){
					channelDivs.push(<div onClick={()=>clickChannel(key)} className="selectedChannel" key={key}>{channel.recipient.tag}</div>);
				}else{
					channelDivs.push(<div onClick={()=>clickChannel(key)} className="channel" key={key}>{channel.recipient.tag}</div>);
				}
			}
		})
	}else{
		client.channels.get(channelId).guild.channels.forEach((channel, key)=>{
			if (channel.type!=='text'){

			}else if (key===channelId){
				channelDivs.push(<div onClick={()=>clickChannel(key)} className="selectedChannel" key={key}>{channel.name}</div>);
			}else{
				channelDivs.push(<div onClick={()=>clickChannel(key)} className="channel" key={key}>{channel.name}</div>);
			}
		})
	}
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
	   			return <div onClick={()=>clickChannel(x.id)} className="channel" key={x.id}>{x.name}</div>
	   		}else{
	   			return null;
	   		}
		})
	});
}
function openDMs(){
	let channels =[] 
	client.channels.forEach((channel)=>{
		if (channel.type==="dm"){
			channels.push(<div onClick={()=>clickChannel(channel.id)} className="channel" key={channel.id}>{channel.recipient.tag}</div>);
		}
	})
	console.log(channels);
	globalPage.setState({
		channels:channels
	})
}
function createMessage(msg){
	let name;
	if (msg.member!=null){
		var nameColor={
			color:'white',
			color:msg.member.displayHexColor,
		}
		name=msg.member.displayName;
	}else{
		name=msg.author.tag;
	}
	
	var messageText=msg.cleanContent;
	let match=messageText.match(/\*{2}[^*]+\*{2}/);
	var newMessageText;
	while(match!=null){
		newMessageText=<span>{newMessageText}{messageText.slice(0,match.index)}<b>{match[0].slice(2,-2)}</b></span>;
		messageText=messageText.slice(match.index+match[0].length);
		match=messageText.match(/\*{2}[^*]+\*{2}/);
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
						<span style={nameColor}>{name}</span>
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
