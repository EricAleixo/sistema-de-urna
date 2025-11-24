class Turma < ApplicationRecord
  has_many :candidaturas, dependent: :destroy
end
