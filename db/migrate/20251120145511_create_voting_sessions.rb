class CreateVotingSessions < ActiveRecord::Migration[7.2]
  def change
    create_table :voting_sessions do |t|
      t.references :mesario, foreign_key: { to_table: :users }
      t.references :turma, null: false, foreign_key: true
      t.integer :status, default: 0
      t.timestamps
    end
  end
end
