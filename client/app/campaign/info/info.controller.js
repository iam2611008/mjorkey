'use strict';

export default class InfoController {
	/*@ngInject*/
	constructor($http, $stateParams, $state, campaignFactory, artistFactory, Auth, $uibModal, mainService, initService, $rootScope) {
		this.campaignID = $stateParams.campaignID;
		this.campaignFactory = campaignFactory;
		this.artistFactory = artistFactory;
		this.getCurrentUser = Auth.getCurrentUserSync;
	    this.currentUser = this.getCurrentUser();
	    this.$state = $state;
	    this.$uibModal = $uibModal;
	    this.mainService = mainService;
	    this.initService = initService;
	    this.$rootScope = $rootScope;
	    this.$http = $http;
	}

	$onInit() {
		this.$rootScope.onInfoPage = true;
		// console.log(this.artistID);
		this.initService.onInfoPage = true;
		this.initService.currentPage = {
			state: 'campaignInfo',
			id: this.campaignID
		};

	    this.campaignFactory.findCampaign(this.campaignID)
	      .then(response => {
	        // console.log(response.data);
	        this.campaign = response.data;
	        this.campaign.progress = Math.round(this.campaign.progress);

	        if(this.campaign.progress >= 100)
	        	this.campaign.percentage = 100;
	        else if(this.campaign.progress<2)
	        	this.campaign.percentage = 0;
	        else
		        this.campaign.percentage = this.campaign.progress;

	        var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
			var currentDate = new Date();
			var endsDate = new Date(this.campaign.ends_date);
			var remainingDays = Math.round(Math.abs((currentDate.getTime() - endsDate.getTime())/(oneDay)));
	        console.log(remainingDays);
	        
	        this.remainingDays = remainingDays;

	        
	  //       this.current_campaignUrl = window.location.href;
			// console.log('campaign', this.current_campaignUrl);
			
			//get shorten url for social sharing
			var current_campaignUrl = window.location.href;
		    console.log(current_campaignUrl);

		    this.$http.post('/api/shorten', {
		      url: current_campaignUrl
		    }).then(function(response){
		      console.log('encode', response.data.shortUrl);
		      this.current_campaignUrl = response.data.shortUrl;
		      this.twitterUrl = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(this.current_campaignUrl);
		    });

	        this.artistFactory.findArtist(this.campaign.artistID)
	    	.then(response => {
	    		this.artist = response.data;
	    		console.log(this.artist);
	    	})
	      });
	}

	facebookShare() {
		FB.ui({
			method: 'share',
			display: 'popup',
			href: this.current_campaignUrl,
		});
	}
	
	purchaseTicket() {
		console.log(this.currentUser);
		if(this.currentUser._id == '')
			this.subscribeFirstModal();
		else {
			this.initService.campaignUrl = this.current_campaignUrl;
			this.$state.go('checkout', {customerID:this.currentUser.stripeId, campaignID: this.campaignID});
		}
	}
	
	subscribeFirstModal() {
		var self = this;
	    var modal = this.$uibModal.open({
	      animation: true,
	      template: require('../../modals/subscribeModal/subscribeModal.html'),
	      controller: function subscribeFirstController() {        
	        this.close_modal = function() {
	        	modal.close();
	        }
	        this.signup = function() {
	        	self.$state.go('signup');
	        	this.close_modal();
	        }
	        this.login = function() {
	        	self.$state.go('login');
	        	this.close_modal();
	        }
	      },
	      controllerAs: 'vm',
	      size: 'medium-st-custom'
	    });
	    this.mainService.set(modal);
	}
}