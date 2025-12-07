class Follower {
  constructor(data) {
    this.id = data.id;
    this.follower_id = data.follower_id;
    this.following_id = data.following_id;
    this.bell_enabled = data.bell_enabled !== undefined ? data.bell_enabled : true;
    this.created_at = data.created_at;
  }

  static fromDatabase(row) {
    return new Follower({
      id: row.id,
      follower_id: row.follower_id,
      following_id: row.following_id,
      bell_enabled: row.bell_enabled,
      created_at: row.created_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      follower_id: this.follower_id,
      following_id: this.following_id,
      bell_enabled: this.bell_enabled,
      created_at: this.created_at
    };
  }
}

module.exports = Follower;
