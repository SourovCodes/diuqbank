// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question_vote.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

QuestionVote _$QuestionVoteFromJson(Map<String, dynamic> json) => QuestionVote(
  submissionId: (json['submissionId'] as num).toInt(),
  value: VoteValue.fromJson(json['value'] as Map<String, dynamic>),
);

Map<String, dynamic> _$QuestionVoteToJson(QuestionVote instance) =>
    <String, dynamic>{
      'submissionId': instance.submissionId,
      'value': instance.value,
    };
