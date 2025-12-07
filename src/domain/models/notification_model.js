class Notification {
  constructor(data) {
    this.id = data.id;
    this.recipient_id = data.recipient_id;
    this.sender_id = data.sender_id;
    this.title = data.title;
    this.type = data.type;
    this.reference_id = data.reference_id;
    this.reference_type = data.reference_type;
    this.is_read = data.is_read || false;
    this.created_at = data.created_at;
  }

  static fromDatabase(row) {
    return new Notification({
      id: row.id,
      recipient_id: row.recipient_id,
      sender_id: row.sender_id,
      title: row.title,
      type: row.type,
      reference_id: row.reference_id,
      reference_type: row.reference_type,
      is_read: row.is_read,
      created_at: row.created_at
    });
  }

  toJSON() {
    return {
      id: this.id,
      recipient_id: this.recipient_id,
      sender_id: this.sender_id,
      title: this.title,
      type: this.type,
      reference_id: this.reference_id,
      reference_type: this.reference_type,
      is_read: this.is_read,
      created_at: this.created_at
    };
  }
}

module.exports = Notification;
