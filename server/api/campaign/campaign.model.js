'use strict';

import mongoose, {Schema} from 'mongoose';

var CampaignSchema = new mongoose.Schema({
  artistName: String,
  city: String,
  state: String,
  startedByUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  description: String,
  campaignId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  goal: String,
  progress: Number,
  users: [{ type: Schema.Types.ObjectId, ref: 'User'}],
  venue: String,
  date: Date,
  timeRemaining: [Number, Number]
});

export default mongoose.model('Campaign', CampaignSchema);