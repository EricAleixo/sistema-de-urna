class VotingSession < ApplicationRecord
  enum status: { closed: 0, open: 1, paused: 2 }

  belongs_to :mesario, class_name: "User"
  belongs_to :turma
end
